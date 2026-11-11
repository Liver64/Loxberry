#!/usr/bin/perl
# LoxBerry CSS Studio - Version: 4.0.1.22
use strict;
use warnings;
use utf8;
use FindBin qw($Bin);
use lib "$Bin/lib";
use JSON::PP qw(encode_json);
use MIME::Base64 qw(decode_base64);
use Encode qw(encode);
use Digest::SHA qw(sha256_hex);
use ThemeStudio ();
my $data = ThemeStudio::request();
my ($config_root, $theme_dir);
eval { ThemeStudio::lock(); ($config_root, $theme_dir) = ThemeStudio::user_roots(); 1 }
    or ThemeStudio::error('500 Internal Server Error', 'saveFailed', 'Theme storage is unavailable');
my $id = $data->{id};
my $existing = ThemeStudio::writable_theme($id, 0);
if ($existing && (!defined($data->{revision}) || $data->{revision} ne ThemeStudio::revision($existing))) {
    ThemeStudio::error('409 Conflict', 'themeChanged', 'Theme changed; reload the Studio');
}
if (!$existing && defined($data->{revision}) && $data->{revision} ne '') {
    ThemeStudio::error('409 Conflict', 'themeChanged', 'The source theme is no longer registered');
}
my $wallpaper_only = $existing && ref($existing->{studio}) eq 'HASH' && ($existing->{studio}{mode} // '') eq 'wallpaper-only';
my $name = $wallpaper_only ? $existing->{name} : $data->{name};
ThemeStudio::error('400 Bad Request', 'invalidThemeName', 'Invalid display name') if !defined($name) || ref($name) || length($name) > 128 || $name =~ /[\x00-\x1f]/;
$name =~ s/^\s+|\s+$//g;
ThemeStudio::error('400 Bad Request', 'invalidThemeName', 'Display name is required') if $name eq '';
my $version = $existing ? ($existing->{version} // '0.1.0') : '0.1.0';
if ($existing) {
    my ($major, $minor, $patch) = $version =~ /\A([0-9]+)\.([0-9]+)\.([0-9]+)/;
    $version = defined($patch) ? join('.', $major, $minor, $patch + 1) : '0.1.1';
}
my $tokens = ref($data->{tokens}) eq 'HASH' ? $data->{tokens} : {};
my $custom_css = defined($data->{custom_css}) && !ref($data->{custom_css}) ? $data->{custom_css} : '';
ThemeStudio::error('400 Bad Request', 'invalidCustomCss', 'Invalid custom CSS') if length($custom_css) > 1024 * 1024 || $custom_css =~ /\x00/;
my $import_meta = ref($data->{import_meta}) eq 'HASH' ? $data->{import_meta} : {};
my @asset_writes;
my $wallpaper_src = ref($data->{wallpaper}) eq 'HASH' ? $data->{wallpaper} : {};
my $wallpaper_image = '';
if ($wallpaper_src->{enabled}) {
    $wallpaper_image = $wallpaper_src->{image} // '';
    ThemeStudio::error('400 Bad Request', 'invalidWallpaperImageData', 'Invalid wallpaper image') if ref($wallpaper_image);
    if ($wallpaper_image =~ m{\Adata:image/(png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=\r\n]+)\z}i) {
        my ($type, $b64) = (lc($1), $2);
        $type = 'jpg' if $type =~ /\Ajpe?g\z/;
        my $raw = decode_base64($b64);
        ThemeStudio::error('400 Bad Request', 'invalidWallpaperImageData', 'Invalid wallpaper bytes') if length($raw) < 16;
        ThemeStudio::error('413 Payload Too Large', 'wallpaperTooLarge', 'Wallpaper exceeds 8 MiB') if length($raw) > 8 * 1024 * 1024;
        my $valid = $type eq 'png' ? substr($raw,0,8) eq "\x89PNG\r\n\x1a\n" :
                    $type eq 'jpg' ? substr($raw,0,3) eq "\xff\xd8\xff" :
                    $type eq 'gif' ? substr($raw,0,6) =~ /\AGIF8[79]a\z/ :
                    substr($raw,0,4) eq 'RIFF' && substr($raw,8,4) eq 'WEBP';
        ThemeStudio::error('400 Bad Request', 'invalidWallpaperImageData', 'Image type does not match bytes') if !$valid;
        $wallpaper_image = "assets/images/$id/wallpaper-" . substr(sha256_hex($raw),0,16) . ".$type";
        my $target = eval { ThemeStudio::safe_asset($wallpaper_image) };
        ThemeStudio::error('500 Internal Server Error', 'saveFailed', 'Wallpaper storage is unavailable') if $@;
        push @asset_writes, [$target, $raw, 0644];
    } elsif ($wallpaper_image =~ m{\Aassets/images/\Q$id\E/[A-Za-z0-9_.-]+\.(?:png|jpe?g|webp|gif)\z}i) {
        my $asset = eval { ThemeStudio::safe_asset($wallpaper_image) };
        ThemeStudio::error('400 Bad Request', 'invalidWallpaperImageData', 'Wallpaper asset is missing') if $@ || !-f $asset;
    } elsif ($wallpaper_image !~ m{\Ahttps?://[^\s"'<>\\]+\z}i) {
        ThemeStudio::error('400 Bad Request', 'invalidWallpaperImageData', 'Use an uploaded image or an HTTP image URL');
    }
}
my $wallpaper = {
    enabled => ($wallpaper_src->{enabled} && $wallpaper_image ne '') ? JSON::PP::true : JSON::PP::false,
    image => $wallpaper_image,
    brightness => _clamp_num($wallpaper_src->{brightness}, 0, 150, 100),
    opacity => _clamp_num($wallpaper_src->{opacity}, 0, 100, 100),
};
# Restricted themes preserve every stored field except wallpaper settings and revision metadata.
if ($wallpaper_only) {
    my $editable = JSON::PP->new->decode(ThemeStudio::read_text($existing->{config_path}));
    $editable->{wallpaper} = $wallpaper;
    $editable->{version} = $version;
    my $css = ThemeStudio::read_text($existing->{css_path});
    $css =~ s{\n?/\* STUDIO WALLPAPER OVERRIDE START \*/[\s\S]*?/\* STUDIO WALLPAPER OVERRIDE END \*/\n?}{}g;
    my $image = $wallpaper->{enabled} ? _theme_file_url_for_css($wallpaper->{image}) : '';
    $image =~ s/["\\\r\n]//g;
    my $background = $image ne '' ? 'url("' . $image . '")' : 'none';
    my $opacity = $wallpaper->{opacity} / 100;
    my $brightness = $wallpaper->{brightness} / 100;
    $css .= "\n/* STUDIO WALLPAPER OVERRIDE START */\nbody.theme-$id\:\:before { background-image: $background !important; opacity: $opacity !important; filter: brightness($brightness) !important; }\n/* STUDIO WALLPAPER OVERRIDE END */\n";
    my @writes = (@asset_writes, [$existing->{css_path}, encode('UTF-8', $css), 0644], [$existing->{config_path}, JSON::PP->new->canonical->pretty->utf8->encode($editable), 0600]);
    eval { ThemeStudio::commit(\@writes); 1 } or ThemeStudio::error('500 Internal Server Error', 'saveFailed', 'Could not publish wallpaper');
    my $saved = LoxBerry::Theme::get_theme($id);
    ThemeStudio::response('200 OK', { ok => JSON::PP::true, id => $id, name => $name, type => 'user', version => $version,
        tokens => $editable->{tokens}, custom_css => $editable->{custom_css}, wallpaper => $wallpaper,
        revision => ThemeStudio::revision($saved), public_css => $saved->{css_url}, css_written => JSON::PP::true });
}
sub _respond { ThemeStudio::response(@_); }
sub _error_payload { return { ok => JSON::PP::false, error_key => $_[0], error => $_[1], error_values => $_[2] }; }
sub _theme_file_url_for_css {
    my ($value) = @_;
    return '/admin/system/themes/theme-file.cgi/' . $value if $value =~ m{\Aassets/[A-Za-z0-9_./-]+\z};
    return $value;
}
sub _make_css_color_opaque {
    my ($value) = @_;
    $value = defined $value ? "$value" : '';
    $value =~ s/^\s+|\s+$//g;
    return $value if $value eq '';

    if ($value =~ /^#([0-9a-fA-F]{8})$/) {
        return '#' . lc(substr($1, 0, 6));
    }
    if ($value =~ /^#([0-9a-fA-F]{4})$/) {
        my @c = split(//, $1);
        return '#' . lc($c[0] . $c[0] . $c[1] . $c[1] . $c[2] . $c[2]);
    }
    if ($value =~ /^rgba?\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/i) {
        my ($r, $g, $b) = (int($1 + 0.5), int($2 + 0.5), int($3 + 0.5));
        $r = 0 if $r < 0; $r = 255 if $r > 255;
        $g = 0 if $g < 0; $g = 255 if $g > 255;
        $b = 0 if $b < 0; $b = 255 if $b > 255;
        return "rgb($r, $g, $b)";
    }
    if ($value =~ /^hsla?\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)/i) {
        my ($h, $s, $l) = ($1, $2, $3);
        $h =~ s/^\s+|\s+$//g;
        $s =~ s/^\s+|\s+$//g;
        $l =~ s/^\s+|\s+$//g;
        return "hsl($h, $s, $l)";
    }

    return $value;
}

sub _force_opaque_theme_tokens {
    my ($token, $value) = @_;
    return _make_css_color_opaque($value) if defined $token && $token eq '--lb-sidebar-bg';
    return $value;
}

sub _css_color_with_alpha {
    my ($value, $alpha) = @_;
    $alpha = 0.15 if !defined $alpha;
    my $hex = _normalize_hex_color($value);
    return $value if $hex eq '';
    my ($r, $g, $b) = map { hex($_) } ($hex =~ /^#(..)(..)(..)$/);
    return sprintf('rgba(%d, %d, %d, %.2f)', $r, $g, $b, $alpha);
}

sub _normalize_hex_color {
    my ($value) = @_;
    $value = defined $value ? "$value" : '';
    $value =~ s/^\s+|\s+$//g;
    if ($value =~ /^#([0-9a-fA-F]{3})$/) {
        my @c = split(//, lc($1));
        return '#' . $c[0] . $c[0] . $c[1] . $c[1] . $c[2] . $c[2];
    }
    if ($value =~ /^#([0-9a-fA-F]{6})$/) {
        return '#' . lc($1);
    }
    if ($value =~ /^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i) {
        my ($r, $g, $b) = (int($1), int($2), int($3));
        $r = 0 if $r < 0; $r = 255 if $r > 255;
        $g = 0 if $g < 0; $g = 255 if $g > 255;
        $b = 0 if $b < 0; $b = 255 if $b > 255;
        return sprintf('#%02x%02x%02x', $r, $g, $b);
    }
    return '';
}

sub _css_relative_luminance {
    my ($value) = @_;
    my $hex = _normalize_hex_color($value);
    return undef if $hex eq '';
    my @rgb = map { hex($_) / 255 } ($hex =~ /^#(..)(..)(..)$/);
    my @linear = map { $_ <= 0.03928 ? $_ / 12.92 : (($_ + 0.055) / 1.055) ** 2.4 } @rgb;
    return 0.2126 * $linear[0] + 0.7152 * $linear[1] + 0.0722 * $linear[2];
}

sub _css_contrast_ratio {
    my ($foreground, $background) = @_;
    my $fg = _css_relative_luminance($foreground);
    my $bg = _css_relative_luminance($background);
    return undef if !defined $fg || !defined $bg;
    my ($lighter, $darker) = $fg >= $bg ? ($fg, $bg) : ($bg, $fg);
    return ($lighter + 0.05) / ($darker + 0.05);
}

sub _readable_text_for_surface {
    my ($background, $light, $dark) = @_;
    $light ||= '#f8fafc';
    $dark  ||= '#111827';
    my $light_ratio = _css_contrast_ratio($light, $background);
    my $dark_ratio  = _css_contrast_ratio($dark, $background);
    return $light if !defined $dark_ratio;
    return $dark if !defined $light_ratio;
    return $light_ratio >= $dark_ratio ? $light : $dark;
}

sub _resolved_clean_color {
    my ($tokens, $name, $depth, $seen) = @_;
    return '' if ref($tokens) ne 'HASH' || !defined $name || $name eq '';
    $depth ||= 0;
    $seen ||= {};
    return '' if $depth > 8 || $seen->{$name};
    $seen->{$name} = 1;

    my $value = _first_clean_token_value($tokens, $name);
    my $hex = _normalize_hex_color($value);
    return $hex if $hex ne '';

    if ($value =~ /^var\(\s*(--lb-[a-z0-9-]+)/i) {
        return _resolved_clean_color($tokens, lc($1), $depth + 1, $seen);
    }
    return '';
}

sub _first_resolved_clean_color {
    my ($tokens, @names) = @_;
    for my $name (@names) {
        my $value = _resolved_clean_color($tokens, $name, 0, {});
        return $value if $value ne '';
    }
    return '';
}

sub _enforce_saved_text_contrast {
    my ($tokens, $text_token, $background_token, $minimum, $light, $dark) = @_;
    return if ref($tokens) ne 'HASH';
    my @background_tokens = ref($background_token) eq 'ARRAY'
        ? @{$background_token}
        : ($background_token);
    my $background = _first_resolved_clean_color($tokens, @background_tokens);
    return if $background eq '';
    my $text = _first_resolved_clean_color($tokens, $text_token);
    my $ratio = $text ne '' ? _css_contrast_ratio($text, $background) : undef;
    if (!defined $ratio || $ratio < $minimum) {
        $tokens->{$text_token} = _readable_text_for_surface($background, $light, $dark);
    }
}

sub _is_classic_loxberry_green {
    my ($value) = @_;
    my $hex = _normalize_hex_color($value);
    return $hex eq '#6dac20' || $hex eq '#5a9418' || $hex eq '#4a7a12';
}

sub _is_plain_white_color {
    my ($value) = @_;
    my $hex = _normalize_hex_color($value);
    return $hex eq '#ffffff';
}

sub _sync_tinted_surface_tokens {
    my ($tokens) = @_;

    return;
}

sub _first_clean_token_value {
    my ($tokens, @names) = @_;
    for my $name (@names) {
        next if !defined $tokens->{$name};
        my $value = "$tokens->{$name}";
        $value =~ s/^\s+|\s+$//g;
        return $value if $value ne '';
    }
    return '';
}

sub _sync_primary_slider_value_tokens {
    my ($tokens) = @_;
    return if ref($tokens) ne 'HASH';
    my $candidate = _first_clean_token_value($tokens,
        '--lb-btn-primary-bg',
        '--lb-active-bg',
        '--lb-btn-group-active-bg',
        '--lb-slider-fill-bg',
        '--lb-slider-active-bg',
        '--lb-range-active-bg'
    );
    my $primary = _first_clean_token_value($tokens, '--lb-primary');

    if ($candidate ne '' && $primary eq '') {
        $tokens->{'--lb-primary'} = $candidate;
        $primary = $candidate;
    }

    my $slider_value_text = _first_clean_token_value(
        $tokens,
        '--lb-slider-value-text'
    );
    if ($primary ne '' && $slider_value_text eq '') {
        $tokens->{'--lb-slider-value-text'} = 'var(--lb-primary)';
    }
}

sub _clamp_int {
    my ($value, $min, $max, $default) = @_;
    $value = defined $value && $value =~ /^-?\d+$/ ? int($value) : $default;
    $value = $min if $value < $min;
    $value = $max if $value > $max;
    return $value;
}

sub _clamp_num {
    my ($value, $min, $max, $default) = @_;
    $value = $default
        if !defined $value || $value !~ /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
    $value = 0 + $value;
    $value = $min if $value < $min;
    $value = $max if $value > $max;
    return int($value * 10 + 0.5) / 10;
}

sub _css_string_escape {
    my ($value) = @_;
    $value = defined $value ? "$value" : '';
    $value =~ s/\\/\\\\/g;
    $value =~ s/"/\\"/g;
    return $value;
}

sub _css_header_value {
    my ($value) = @_;
    $value = defined $value ? "$value" : '';
    $value =~ s/[\r\n]+/ /g;
    $value =~ s{\*/}{* /}g;
    $value =~ s/^\s+|\s+$//g;
    return $value;
}

sub _sync_wallpaper_header_metadata {
    my ($css_content, $wallpaper_ref) = @_;
    $css_content = defined $css_content ? "$css_content" : '';

    $css_content =~ s{^[ \t]*\*?[ \t]*Wallpaper-(?:URL|Brightness|Opacity):[^\r\n]*(?:\r?\n|\z)}{}gim;

    return $css_content
        if ref($wallpaper_ref) ne 'HASH'
        || !$wallpaper_ref->{enabled}
        || !$wallpaper_ref->{image};

    my $image = _css_header_value($wallpaper_ref->{image});
    my $brightness = _clamp_int($wallpaper_ref->{brightness}, 0, 150, 100);
    my $opacity = _clamp_int($wallpaper_ref->{opacity}, 0, 100, 100);
    my $metadata = " * Wallpaper-URL: $image\n";
    $metadata .= " * Wallpaper-Brightness: $brightness\n";
    $metadata .= " * Wallpaper-Opacity: $opacity\n";

    if ($css_content =~ m{\A/\*}) {
        $css_content =~ s{\*/}{$metadata . "*/"}e;
        return $css_content;
    }

    return "/*\n$metadata*/\n\n" . $css_content;
}

my %clean_tokens;
sub _blocked_token {
    my ($token) = @_;
    return 1 if $token =~ /^--lb-table-status-/;

    return 1 if $token =~ /^--lb-(?:success|ok|warning|warn|danger|error|critical|info|notice|alert)(?:-|$)/;

    return 0 if $token eq '--lb-tooltip-bg' || $token eq '--lb-tooltip-text';
    return 1 if $token =~ /^--lb-tooltip-/;
    return 0;
}
for my $token (sort keys %{$tokens}) {
    my $value = $tokens->{$token};
    next if $token !~ /^--lb-[a-z0-9-]+$/;
    next if _blocked_token($token);
    next if !defined $value || ref($value);
    $value = "$value";
    $value =~ s/^\s+|\s+$//g;
    next if $value eq '';
    next if $value =~ /[{};]/;
    $value = _force_opaque_theme_tokens($token, $value);
    $clean_tokens{$token} = $value;
}
_sync_primary_slider_value_tokens(\%clean_tokens) if keys(%clean_tokens);
_sync_tinted_surface_tokens(\%clean_tokens) if keys(%clean_tokens);

if (keys(%clean_tokens)) {
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-text', '--lb-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-text-secondary', '--lb-bg', 4.5, '#e5e7eb', '#374151');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-text-muted', '--lb-bg', 3.0, '#cbd5e1', '#4b5563');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-sidebar-text', '--lb-sidebar-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-card-text', '--lb-card-bg', 4.5, '#f8fafc', '#111827');

    _enforce_saved_text_contrast(\%clean_tokens, '--lb-input-text', ['--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-input-hover-text', ['--lb-input-hover-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-input-placeholder-text', ['--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-input-disabled-text', ['--lb-input-disabled-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-input-disabled-placeholder-text', ['--lb-input-disabled-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-textarea-text', ['--lb-textarea-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-select-text', ['--lb-select-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-native-select-text', ['--lb-native-select-bg', '--lb-select-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');

    _enforce_saved_text_contrast(\%clean_tokens, '--lb-table-text', '--lb-table-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-table-cell-text', '--lb-table-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-table-row-text', '--lb-table-row-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-table-header-text', '--lb-table-header-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-table-footer-text', '--lb-table-footer-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-table-row-hover-text', '--lb-table-row-hover-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-table-hover-text', '--lb-table-hover-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-table-compact-text', '--lb-table-compact-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-table-compact-header-text', '--lb-table-compact-header-bg', 4.5, '#f8fafc', '#111827');
    _enforce_saved_text_contrast(\%clean_tokens, '--lb-table-compact-hover-text', '--lb-table-compact-hover-bg', 4.5, '#f8fafc', '#111827');
}

my $focus_source = _first_clean_token_value(\%clean_tokens, '--lb-focus-ring', '--lb-primary');
if ($focus_source ne '') {
    $clean_tokens{'--lb-focus-ring'} = _css_color_with_alpha($focus_source, 0.15);
}
my $focus_strong_source = _first_clean_token_value(\%clean_tokens, '--lb-focus-ring-strong', '--lb-primary');
if ($focus_strong_source ne '') {
    $clean_tokens{'--lb-focus-ring-strong'} = _css_color_with_alpha($focus_strong_source, 0.20);
}

if (!exists $clean_tokens{'--lb-card-text'} || $clean_tokens{'--lb-card-text'} eq '') {
    my $card_text = _first_clean_token_value(\%clean_tokens, '--lb-text');
    $clean_tokens{'--lb-card-text'} = $card_text ne '' ? $card_text : 'var(--lb-text)';
}
if (!exists $clean_tokens{'--lb-note-text'} || $clean_tokens{'--lb-note-text'} eq '') {
    my $note_text = _first_clean_token_value(\%clean_tokens, '--lb-card-text', '--lb-text');
    $clean_tokens{'--lb-note-text'} = $note_text ne '' ? $note_text : 'var(--lb-card-text, var(--lb-text))';
}

if (!exists $clean_tokens{'--lb-table-cell-border-width'} || $clean_tokens{'--lb-table-cell-border-width'} eq '') {
    $clean_tokens{'--lb-table-cell-border-width'} = '0px';
}

my $btn_group_active_text = _first_clean_token_value(\%clean_tokens,
    '--lb-btn-group-active-text',
    '--lb-active-text',
    '--lb-btn-primary-text'
);
if (!exists $clean_tokens{'--lb-btn-group-hover-text'} || $clean_tokens{'--lb-btn-group-hover-text'} eq '') {
    if ($btn_group_active_text ne '') {
        $clean_tokens{'--lb-btn-group-hover-text'} = $btn_group_active_text;
    } else {
        $clean_tokens{'--lb-btn-group-hover-text'} = 'var(--lb-btn-group-active-text, var(--lb-active-text, var(--lb-btn-primary-text, #fff)))';
    }
}

my $meaningful_custom_css = $custom_css;
$meaningful_custom_css =~ s{/\*[\s\S]*?\*/}{}g;
$meaningful_custom_css =~ s/^\s+|\s+$//g;
if (!keys(%clean_tokens) && $meaningful_custom_css eq '' && !$wallpaper->{enabled}) {
    _respond('400 Bad Request', _error_payload('emptyTheme', 'emptyTheme', {}));
}

my $css_file = "theme-$id.css";
my $editable = {
    file_version => '4.0.1.22', id => $id, name => $name, type => 'user', version => $version,
    selectable => JSON::PP::true, css => $css_file, tokens => \%clean_tokens,
    custom_css => $custom_css, studio_model => (ref($data->{studio_model}) eq 'HASH' ? $data->{studio_model} : {}),
    import_meta => $import_meta, wallpaper => $wallpaper,
    studio => { generator => 'CSS-Studio', editable => JSON::PP::true, deletable => JSON::PP::true },
    studio_version => '4.0.1.22',
};
my $header_name = _css_header_value($name);
my $css = "/*\n";
$css .= " * CSS-Studio\n";
$css .= " * Generated by LoxBerry CSS Framework Design Studio\n";
$css .= " * Version: $version\n * File-Version: 4.0.1.22\n * Theme: $header_name ($id)\n";
$css .= " * Source-JSON: config/system/themes/$id.json\n";
$css .= " * Runtime scope: body.theme-$id / .theme-$id\n";
if ($wallpaper->{enabled} && $wallpaper->{image}) {
    my $wallpaper_header_image = _css_header_value($wallpaper->{image});
    $css .= " * Wallpaper-URL: $wallpaper_header_image\n";
    $css .= " * Wallpaper-Brightness: $wallpaper->{brightness}\n";
    $css .= " * Wallpaper-Opacity: $wallpaper->{opacity}\n";
}
$css .= " */\n\n";
$css .= "body.theme-$id,\n.theme-$id {\n";
for my $token (sort keys %clean_tokens) {
    $css .= "  $token: $clean_tokens{$token};\n";
}

$css .= "}\n\n";
$css .= "/* USER CUSTOM CSS START */\n" . $custom_css . "\n/* USER CUSTOM CSS END */\n";

if ($wallpaper->{enabled}) {
    my $img = _css_string_escape(_theme_file_url_for_css($wallpaper->{image}));
    my $opacity = sprintf('%.2f', $wallpaper->{opacity} / 100);
    my $brightness = sprintf('%.2f', $wallpaper->{brightness} / 100);
    $css .= "\n/* DESIGN STUDIO WALLPAPER START */\n";
    $css .= "body.theme-$id .lb-main, .theme-$id .lb-main {\n";
    $css .= "  position: relative !important;\n";
    $css .= "  overflow: hidden;\n";
    $css .= "  text-shadow: none;\n";
    $css .= "}\n";
    $css .= "body.theme-$id .lb-main::before, .theme-$id .lb-main::before {\n";
    $css .= "  content: \"\";\n";
    $css .= "  position: fixed;\n";
    $css .= "  inset: 0;\n";
    $css .= "  pointer-events: none;\n";
    $css .= "  background-image: url(\"$img\");\n";
    $css .= "  background-size: cover;\n";
    $css .= "  background-repeat: no-repeat;\n";
    $css .= "  background-position: center center;\n";
    $css .= "  opacity: $opacity;\n";
    $css .= "  filter: brightness($brightness);\n";
    $css .= "  z-index: 0;\n";
    $css .= "}\n";
    $css .= "body.theme-$id .lb-main > *, .theme-$id .lb-main > * { position: relative; z-index: 1; }\n";
    $css .= "/* DESIGN STUDIO WALLPAPER END */\n";
}

$css .= "\n/* DESIGN STUDIO JQM COMPAT START */\n";
$css .= "/* V250: Token based jQuery Mobile compatibility for generated user themes. */\n";
$css .= "body.theme-$id .ui-page, body.theme-$id .ui-content, body.theme-$id .ui-body-a, body.theme-$id .ui-body-b, body.theme-$id .ui-body-c, body.theme-$id .ui-body-d, body.theme-$id .ui-body-e, body.theme-$id .ui-overlay-a,\n";
$css .= ".theme-$id .ui-page, .theme-$id .ui-content, .theme-$id .ui-body-a, .theme-$id .ui-body-b, .theme-$id .ui-body-c, .theme-$id .ui-body-d, .theme-$id .ui-body-e, .theme-$id .ui-overlay-a {\n";
$css .= "  background: var(--lb-bg, transparent) !important;\n";
$css .= "  color: var(--lb-text, inherit) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-btn:not(.ui-select > .ui-btn), body.theme-$id .ui-btn:not(.ui-select > .ui-btn):visited, body.theme-$id .ui-btn:not(.ui-select > .ui-btn):link, body.theme-$id a.ui-btn:not(.ui-select > .ui-btn), body.theme-$id button.ui-btn:not(.ui-select > .ui-btn),\n";
$css .= ".theme-$id .ui-btn:not(.ui-select > .ui-btn), .theme-$id .ui-btn:not(.ui-select > .ui-btn):visited, .theme-$id .ui-btn:not(.ui-select > .ui-btn):link, .theme-$id a.ui-btn:not(.ui-select > .ui-btn), .theme-$id button.ui-btn:not(.ui-select > .ui-btn) {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-btn-bg, var(--lb-card-bg, #fff)) !important;\n";
$css .= "  color: var(--lb-btn-text, var(--lb-text, inherit)) !important;\n";
$css .= "  border-color: var(--lb-btn-border, var(--lb-border-color, rgba(0,0,0,.18))) !important;\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-width: 1px !important;\n";
$css .= "  border-radius: var(--lb-btn-radius, var(--lb-radius, 4px)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-btn:not(.ui-select > .ui-btn):hover, body.theme-$id a.ui-btn:not(.ui-select > .ui-btn):hover, body.theme-$id button.ui-btn:not(.ui-select > .ui-btn):hover,\n";
$css .= ".theme-$id .ui-btn:not(.ui-select > .ui-btn):hover, .theme-$id a.ui-btn:not(.ui-select > .ui-btn):hover, .theme-$id button.ui-btn:not(.ui-select > .ui-btn):hover {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-btn-hover-bg, var(--lb-btn-bg, var(--lb-card-bg, #fff))) !important;\n";
$css .= "  color: var(--lb-btn-hover-text, var(--lb-btn-text, var(--lb-text, inherit))) !important;\n";
$css .= "  border-color: var(--lb-btn-hover-border, var(--lb-btn-border, var(--lb-border-color, rgba(0,0,0,.18)))) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-btn:not(.ui-select > .ui-btn).ui-btn-active, body.theme-$id .ui-btn:not(.ui-select > .ui-btn).ui-state-persist, body.theme-$id .ui-btn-active:not(.ui-select > .ui-btn),\n";
$css .= ".theme-$id .ui-btn:not(.ui-select > .ui-btn).ui-btn-active, .theme-$id .ui-btn:not(.ui-select > .ui-btn).ui-state-persist, .theme-$id .ui-btn-active:not(.ui-select > .ui-btn) {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-active-bg, var(--lb-btn-primary-bg, var(--lb-primary, #007aff))) !important;\n";
$css .= "  color: var(--lb-active-text, var(--lb-btn-primary-text, #fff)) !important;\n";
$css .= "  border-color: var(--lb-active-border, var(--lb-btn-primary-border, var(--lb-primary, #007aff))) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "}\n";

$css .= "/* V513: Core-owned input/select/textarea surfaces; tokens only. */\n";
$css .= "body.theme-$id .ui-checkbox .ui-btn, body.theme-$id .ui-radio .ui-btn, .theme-$id .ui-checkbox .ui-btn, .theme-$id .ui-radio .ui-btn {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-input-bg, var(--lb-btn-bg, var(--lb-card-bg, #fff))) !important;\n";
$css .= "  color: var(--lb-input-text, var(--lb-btn-text, var(--lb-text, inherit))) !important;\n";
$css .= "  border-color: var(--lb-input-border, var(--lb-btn-border, var(--lb-border-color, rgba(0,0,0,.18)))) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-checkbox .ui-btn.ui-checkbox-on, body.theme-$id .ui-radio .ui-btn.ui-radio-on,\n";
$css .= ".theme-$id .ui-checkbox .ui-btn.ui-checkbox-on, .theme-$id .ui-radio .ui-btn.ui-radio-on {\n";
$css .= "  background-color: var(--lb-active-bg, var(--lb-btn-primary-bg, var(--lb-primary, #007aff))) !important;\n";
$css .= "  color: var(--lb-active-text, var(--lb-btn-primary-text, #fff)) !important;\n";
$css .= "  border-color: var(--lb-active-border, var(--lb-btn-primary-border, var(--lb-primary, #007aff))) !important;\n";
$css .= "}\n";
$css .= "/* V252: JQM checkbox/radio icon compatibility. Keep icons in the active theme color and remove old jQM icon shadows. */\n";
$css .= "body.theme-$id .ui-checkbox .ui-btn::after, body.theme-$id .ui-radio .ui-btn::after,\n";
$css .= ".theme-$id .ui-checkbox .ui-btn::after, .theme-$id .ui-radio .ui-btn::after {\n";
$css .= "  background-color: var(--lb-checkbox-bg, var(--lb-radio-bg, var(--lb-input-bg, #fff))) !important;\n";
$css .= "  border: 2px solid var(--lb-checkbox-border, var(--lb-radio-border, var(--lb-input-border, var(--lb-border-color, rgba(0,0,0,.25))))) !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-checkbox .ui-btn::after, .theme-$id .ui-checkbox .ui-btn::after {\n";
$css .= "  border-radius: var(--lb-checkbox-radius, 3px) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-radio .ui-btn::after, .theme-$id .ui-radio .ui-btn::after {\n";
$css .= "  border-radius: 999px !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-checkbox .ui-btn.ui-checkbox-on::after, body.theme-$id .ui-radio .ui-btn.ui-radio-on::after,\n";
$css .= ".theme-$id .ui-checkbox .ui-btn.ui-checkbox-on::after, .theme-$id .ui-radio .ui-btn.ui-radio-on::after {\n";
$css .= "  background-color: var(--lb-checkbox-checked-bg, var(--lb-radio-checked-bg, var(--lb-active-text, var(--lb-btn-primary-text, #fff)))) !important;\n";
$css .= "  border-color: var(--lb-checkbox-checked-border, var(--lb-radio-checked-border, var(--lb-active-text, var(--lb-btn-primary-text, #fff)))) !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-checkbox .ui-btn.ui-checkbox-on::after, .theme-$id .ui-checkbox .ui-btn.ui-checkbox-on::after {\n";
$css .= "  background-image: var(--lb-checkbox-check-icon, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%23000000' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' d='M2 6.5L4.5 9.5L10 3'/%3E%3C/svg%3E\")) !important;\n";
$css .= "  background-repeat: no-repeat !important;\n";
$css .= "  background-position: center !important;\n";
$css .= "  background-size: 12px 12px !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-radio .ui-btn.ui-radio-on::after, .theme-$id .ui-radio .ui-btn.ui-radio-on::after {\n";
$css .= "  background-image: none !important;\n";
$css .= "  box-shadow: inset 0 0 0 4px var(--lb-active-bg, var(--lb-btn-primary-bg, var(--lb-primary, #007aff))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-controlgroup-controls .ui-btn, .theme-$id .ui-controlgroup-controls .ui-btn {\n";
$css .= "  border-radius: 0 !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-controlgroup-controls .ui-btn:first-child, .theme-$id .ui-controlgroup-controls .ui-btn:first-child {\n";
$css .= "  border-top-left-radius: var(--lb-btn-radius, var(--lb-radius, 4px)) !important;\n";
$css .= "  border-bottom-left-radius: var(--lb-btn-radius, var(--lb-radius, 4px)) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-controlgroup-controls .ui-btn:last-child, .theme-$id .ui-controlgroup-controls .ui-btn:last-child {\n";
$css .= "  border-top-right-radius: var(--lb-btn-radius, var(--lb-radius, 4px)) !important;\n";
$css .= "  border-bottom-right-radius: var(--lb-btn-radius, var(--lb-radius, 4px)) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-slider-track, .theme-$id .ui-slider-track {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-slider-track-bg, var(--lb-border-color, rgba(0,0,0,.18))) !important;\n";
$css .= "  border-color: var(--lb-slider-border, var(--lb-border-color, rgba(0,0,0,.18))) !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-slider-bg, .theme-$id .ui-slider-bg {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-slider-fill-bg, var(--lb-slider-active-bg, var(--lb-active-bg, var(--lb-primary, #007aff)))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-slider-handle, body.theme-$id .ui-slider-track .ui-btn.ui-slider-handle,\n";
$css .= ".theme-$id .ui-slider-handle, .theme-$id .ui-slider-track .ui-btn.ui-slider-handle {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-slider-thumb-bg, var(--lb-slider-fill-bg, var(--lb-slider-active-bg, var(--lb-active-bg, var(--lb-primary, #007aff))))) !important;\n";
$css .= "  border-color: var(--lb-slider-thumb-border-color, var(--lb-slider-thumb-border, #fff)) !important;\n";
$css .= "  box-shadow: var(--lb-slider-thumb-shadow, 0 1px 5px rgba(0,0,0,.25)) !important;\n";
$css .= "}\n";
$css .= "/* V251/V252: JQM switch/flipswitch compatibility. Keep old data-role=slider toggles token based. */\n";
$css .= "body.theme-$id .ui-slider-switch.ui-slider-track, body.theme-$id .ui-slider-switch,\n";
$css .= ".theme-$id .ui-slider-switch.ui-slider-track, .theme-$id .ui-slider-switch {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-switch-off-bg, var(--lb-toggle-bg, var(--lb-btn-bg, rgba(0,0,0,.18)))) !important;\n";
$css .= "  border-color: var(--lb-switch-border, var(--lb-toggle-border, var(--lb-btn-border, var(--lb-border-color, rgba(0,0,0,.18))))) !important;\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-width: 1px !important;\n";
$css .= "  border-radius: var(--lb-switch-radius, var(--lb-toggle-radius, var(--lb-btn-radius, var(--lb-radius, 999px)))) !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-slider-switch .ui-slider-label, .theme-$id .ui-slider-switch .ui-slider-label {\n";
$css .= "  background-image: none !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  font-family: var(--lb-font) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-slider-switch .ui-slider-label-a, .theme-$id .ui-slider-switch .ui-slider-label-a {\n";
$css .= "  background-color: var(--lb-switch-on-bg, var(--lb-toggle-active-bg, var(--lb-active-bg, var(--lb-primary, #007aff)))) !important;\n";
$css .= "  color: var(--lb-switch-on-text, var(--lb-toggle-active-text, var(--lb-active-text, var(--lb-btn-primary-text, #fff)))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-slider-switch .ui-slider-label-b, .theme-$id .ui-slider-switch .ui-slider-label-b {\n";
$css .= "  background-color: var(--lb-switch-off-bg, var(--lb-toggle-bg, var(--lb-btn-bg, rgba(0,0,0,.18)))) !important;\n";
$css .= "  color: var(--lb-switch-off-text, var(--lb-toggle-text, var(--lb-btn-text, var(--lb-text, inherit)))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-slider-switch .ui-slider-handle, body.theme-$id .ui-slider-switch .ui-btn.ui-slider-handle,\n";
$css .= ".theme-$id .ui-slider-switch .ui-slider-handle, .theme-$id .ui-slider-switch .ui-btn.ui-slider-handle {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-switch-thumb-bg, var(--lb-toggle-thumb-bg, var(--lb-toggle-knob-bg, var(--lb-slider-thumb-bg, #fff)))) !important;\n";
$css .= "  border-color: var(--lb-switch-thumb-border, var(--lb-toggle-thumb-border, var(--lb-slider-thumb-border-color, rgba(0,0,0,.18)))) !important;\n";
$css .= "  border-radius: var(--lb-toggle-thumb-radius, var(--lb-toggle-knob-radius, 999px)) !important;\n";
$css .= "  box-shadow: var(--lb-switch-thumb-shadow, var(--lb-toggle-thumb-shadow, 0 1px 4px rgba(0,0,0,.22))) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-flipswitch, .theme-$id .ui-flipswitch {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-switch-off-bg, var(--lb-toggle-bg, var(--lb-btn-bg, rgba(0,0,0,.18)))) !important;\n";
$css .= "  border-color: var(--lb-switch-border, var(--lb-toggle-border, var(--lb-btn-border, var(--lb-border-color, rgba(0,0,0,.18))))) !important;\n";
$css .= "  border-radius: var(--lb-switch-radius, var(--lb-toggle-radius, var(--lb-btn-radius, var(--lb-radius, 999px)))) !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-flipswitch.ui-flipswitch-active, .theme-$id .ui-flipswitch.ui-flipswitch-active {\n";
$css .= "  background-color: var(--lb-switch-on-bg, var(--lb-toggle-active-bg, var(--lb-active-bg, var(--lb-primary, #007aff)))) !important;\n";
$css .= "  color: var(--lb-switch-on-text, var(--lb-toggle-active-text, var(--lb-active-text, var(--lb-btn-primary-text, #fff)))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .ui-flipswitch .ui-flipswitch-on, .theme-$id .ui-flipswitch .ui-flipswitch-on {\n";
$css .= "  background-image: none !important;\n";
$css .= "  background-color: var(--lb-switch-thumb-bg, var(--lb-toggle-thumb-bg, var(--lb-toggle-knob-bg, #fff))) !important;\n";
$css .= "  border-color: var(--lb-switch-thumb-border, var(--lb-toggle-thumb-border, rgba(0,0,0,.18))) !important;\n";
$css .= "  border-radius: var(--lb-toggle-thumb-radius, var(--lb-toggle-knob-radius, 999px)) !important;\n";
$css .= "  box-shadow: var(--lb-switch-thumb-shadow, var(--lb-toggle-thumb-shadow, 0 1px 4px rgba(0,0,0,.22))) !important;\n";
$css .= "}\n";
$css .= "/* DESIGN STUDIO JQM COMPAT END */\n";

$css .= "/* V517: jQM surface ownership - narrow, no native side effects. */\n";

$css .= "body.theme-$id .ui-select, .theme-$id .ui-select {\n";
$css .= "  background: transparent !important;\n";
$css .= "  background-color: transparent !important;\n";
$css .= "  background-image: none !important;\n";
$css .= "  border: 0 !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "}\n";

$css .= "/* V521: single form-field frame contract. */\n";
$css .= "html body.theme-$id #page_content#page_content .ui-input-text:has(> input.lb-input),\n";
$css .= "html body.theme-$id #page_content#page_content .ui-input-search:has(> input.lb-input),\n";
$css .= "html body.theme-$id #page_content#page_content .ui-textinput:has(> input.lb-input),\n";
$css .= "html body.theme-$id #page_content#page_content .ui-input-text:has(> textarea.lb-textarea),\n";
$css .= "body.theme-$id .ui-input-text:has(> input.lb-input), body.theme-$id .ui-input-search:has(> input.lb-input), body.theme-$id .ui-textinput:has(> input.lb-input),\n";
$css .= ".theme-$id .ui-input-text:has(> input.lb-input), .theme-$id .ui-input-search:has(> input.lb-input), .theme-$id .ui-textinput:has(> input.lb-input) {\n";
$css .= "  background: transparent !important;\n";
$css .= "  background-color: transparent !important;\n";
$css .= "  background-image: none !important;\n";
$css .= "  border: 0 !important;\n";
$css .= "  border-radius: 0 !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  outline: 0 !important;\n";
$css .= "  padding: 0 !important;\n";
$css .= "  margin: 0 !important;\n";
$css .= "}\n";

$css .= "html body.theme-$id #page_content#page_content input.lb-input:not([type=\"hidden\"]),\n";
$css .= "html body.theme-$id #page_content#page_content textarea.lb-textarea,\n";
$css .= "html body.theme-$id #page_content#page_content select.lb-select,\n";
$css .= "body.theme-$id input.lb-input:not([type=\"hidden\"]), body.theme-$id textarea.lb-textarea, body.theme-$id select.lb-select,\n";
$css .= ".theme-$id input.lb-input:not([type=\"hidden\"]), .theme-$id textarea.lb-textarea, .theme-$id select.lb-select {\n";
$css .= "  border-width: 1px !important;\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-radius: var(--lb-input-radius, var(--lb-radius-input, var(--lb-radius, 10px))) !important;\n";
$css .= "  box-sizing: border-box !important;\n";
$css .= "}\n";

$css .= "body.theme-$id .ui-input-text:not(:has(> input.lb-input)):not(:has(> textarea.lb-textarea)),\n";
$css .= "body.theme-$id .ui-input-search:not(:has(> input.lb-input)), body.theme-$id .ui-textinput:not(:has(> input.lb-input)),\n";
$css .= "body.theme-$id .ui-select > .ui-btn,\n";
$css .= ".theme-$id .ui-input-text:not(:has(> input.lb-input)):not(:has(> textarea.lb-textarea)),\n";
$css .= ".theme-$id .ui-input-search:not(:has(> input.lb-input)), .theme-$id .ui-textinput:not(:has(> input.lb-input)), .theme-$id .ui-select > .ui-btn {\n";
$css .= "  border-width: 1px !important;\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-radius: var(--lb-input-radius, var(--lb-radius-input, var(--lb-radius, 10px))) !important;\n";
$css .= "  box-sizing: border-box !important;\n";
$css .= "}\n";

$css .= "/* V546: disabled form-control foreground contract. */\n";
$css .= "html body.theme-$id #page_content#page_content input.lb-input:disabled,\n";
$css .= "html body.theme-$id #page_content#page_content textarea.lb-input:disabled,\n";
$css .= "html body.theme-$id #page_content#page_content textarea.lb-textarea:disabled,\n";
$css .= "html body.theme-$id #page_content#page_content select.lb-select:disabled,\n";
$css .= "body.theme-$id input.lb-input:disabled, body.theme-$id textarea.lb-input:disabled, body.theme-$id textarea.lb-textarea:disabled, body.theme-$id select.lb-select:disabled,\n";
$css .= ".theme-$id input.lb-input:disabled, .theme-$id textarea.lb-input:disabled, .theme-$id textarea.lb-textarea:disabled, .theme-$id select.lb-select:disabled {\n";
$css .= "  color: var(--lb-input-disabled-text, var(--lb-input-text, #111827)) !important;\n";
$css .= "  -webkit-text-fill-color: var(--lb-input-disabled-text, var(--lb-input-text, #111827)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";

$css .= "/* V431: LoxBerry Core dark-surface text contract.\n";
$css .= "   The active user theme supplies the page foreground. Core widgets then\n";
$css .= "   receive explicit component foreground/background pairs instead of broad\n";
$css .= "   label/table overrides. Plugin component rules remain untouched. */\n";

$css .= "body.theme-$id #page_content, .theme-$id #page_content,\n";
$css .= "body.theme-$id .page_content, .theme-$id .page_content,\n";
$css .= "body.theme-$id .lb-content, .theme-$id .lb-content {\n";
$css .= "  color: var(--lb-text, inherit);\n";
$css .= "  text-shadow: none;\n";
$css .= "}\n";

$css .= "/* V542: Legacy formtable page-text inheritance. */\n";
$css .= "html body.theme-$id #page_content table.formtable > :is(thead, tbody, tfoot) > tr > :is(th, td),\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > :is(thead, tbody, tfoot) > tr > :is(th, td) {\n";
$css .= "  color: var(--lb-text, inherit) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "html body.theme-$id #page_content table.formtable > :is(thead, tbody, tfoot) > tr > :is(th, td) > :is(h1, h2, h3, h4, h5, h6, label, legend),\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > :is(thead, tbody, tfoot) > tr > :is(th, td) > :is(h1, h2, h3, h4, h5, h6, label, legend) {\n";
$css .= "  color: var(--lb-text, inherit) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "html body.theme-$id #page_content table.formtable > :is(thead, tbody, tfoot) > tr > :is(th, td) > font,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > :is(thead, tbody, tfoot) > tr > :is(th, td) > font {\n";
$css .= "  color: var(--lb-text-secondary, var(--lb-text, inherit)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";

$css .= "body.theme-$id #page_content > p, .theme-$id #page_content > p,\n";
$css .= "body.theme-$id #page_content > h1, body.theme-$id #page_content > h2, body.theme-$id #page_content > h3, body.theme-$id #page_content > h4,\n";
$css .= ".theme-$id #page_content > h1, .theme-$id #page_content > h2, .theme-$id #page_content > h3, .theme-$id #page_content > h4,\n";
$css .= "body.theme-$id #page_content .lb-form-label, .theme-$id #page_content .lb-form-label,\n";
$css .= "body.theme-$id #page_content .formlabel, .theme-$id #page_content .formlabel,\n";
$css .= "body.theme-$id #page_content fieldset > legend, .theme-$id #page_content fieldset > legend {\n";
$css .= "  color: var(--lb-text, inherit) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id #page_content .lb-form-help, .theme-$id #page_content .lb-form-help,\n";
$css .= "body.theme-$id #page_content .hint, .theme-$id #page_content .hint,\n";
$css .= "body.theme-$id #page_content [style*='color: var(--lb-gray-400)'], .theme-$id #page_content [style*='color: var(--lb-gray-400)'],\n";
$css .= "body.theme-$id #page_content [style*='color: var(--lb-gray-500)'], .theme-$id #page_content [style*='color: var(--lb-gray-500)'],\n";
$css .= "body.theme-$id #page_content [style*='color: var(--lb-gray-600)'], .theme-$id #page_content [style*='color: var(--lb-gray-600)'] {\n";
$css .= "  color: var(--lb-text-secondary, var(--lb-text, inherit)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";

$css .= "body.theme-$id #page_content label:has(input[type='checkbox']), .theme-$id #page_content label:has(input[type='checkbox']),\n";
$css .= "body.theme-$id #page_content label:has(input[type='radio']), .theme-$id #page_content label:has(input[type='radio']) {\n";
$css .= "  color: var(--lb-text, inherit) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";

$css .= "body.theme-$id #page_content details.lb-collapsible > h4, .theme-$id #page_content details.lb-collapsible > h4,\n";
$css .= "body.theme-$id #page_content table.lb-table td:not([style*='background-color']), .theme-$id #page_content table.lb-table td:not([style*='background-color']),\n";
$css .= "body.theme-$id #page_content table.lb-table th, .theme-$id #page_content table.lb-table th {\n";
$css .= "  color: var(--lb-table-text, var(--lb-text, inherit)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";

$css .= "body.theme-$id #page_content .mqttgw-group, .theme-$id #page_content .mqttgw-group,\n";
$css .= "body.theme-$id #page_content .mqttgw-group > summary, .theme-$id #page_content .mqttgw-group > summary,\n";
$css .= "body.theme-$id #page_content .mqttgw-group > .lb-collapsible-content, .theme-$id #page_content .mqttgw-group > .lb-collapsible-content,\n";
$css .= "body.theme-$id #page_content .mqttgw-subgroup, .theme-$id #page_content .mqttgw-subgroup,\n";
$css .= "body.theme-$id #page_content .mqttgw-topic-row, .theme-$id #page_content .mqttgw-topic-row,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-panel, .theme-$id #page_content .mqttgw-traffic-panel,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-panel-header, .theme-$id #page_content .mqttgw-traffic-panel-header,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-toolbar, .theme-$id #page_content .mqttgw-traffic-toolbar,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-colheader, .theme-$id #page_content .mqttgw-traffic-colheader,\n";
$css .= "body.theme-$id #page_content .mqttgw-tgroup, .theme-$id #page_content .mqttgw-tgroup,\n";
$css .= "body.theme-$id #page_content .mqttgw-tgroup > summary, .theme-$id #page_content .mqttgw-tgroup > summary,\n";
$css .= "body.theme-$id #page_content #topic_groups_container > details, .theme-$id #page_content #topic_groups_container > details,\n";
$css .= "body.theme-$id #page_content #topic_groups_container details > summary, .theme-$id #page_content #topic_groups_container details > summary {\n";
$css .= "  background-color: var(--lb-card-bg, var(--lb-bg-elevated, var(--lb-bg, transparent))) !important;\n";
$css .= "  color: var(--lb-card-text, var(--lb-text, inherit)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";

$css .= "body.theme-$id #page_content .mqttgw-filter-label, .theme-$id #page_content .mqttgw-filter-label,\n";
$css .= "body.theme-$id #page_content .mqttgw-filter-count, .theme-$id #page_content .mqttgw-filter-count,\n";
$css .= "body.theme-$id #page_content .mqttgw-topic-name, .theme-$id #page_content .mqttgw-topic-name,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-title, .theme-$id #page_content .mqttgw-traffic-title,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-name, .theme-$id #page_content .mqttgw-traffic-name,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-cmd-text, .theme-$id #page_content .mqttgw-traffic-cmd-text,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-value, .theme-$id #page_content .mqttgw-traffic-value,\n";
$css .= "body.theme-$id #page_content #topic_groups_container summary, .theme-$id #page_content #topic_groups_container summary,\n";
$css .= "body.theme-$id #page_content #topic_groups_container strong, .theme-$id #page_content #topic_groups_container strong,\n";
$css .= "body.theme-$id #page_content #topic_groups_container label, .theme-$id #page_content #topic_groups_container label {\n";
$css .= "  color: var(--lb-card-text, var(--lb-text, inherit)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id #page_content .mqttgw-topic-payload, .theme-$id #page_content .mqttgw-topic-payload,\n";
$css .= "body.theme-$id #page_content .mqttgw-group-count, .theme-$id #page_content .mqttgw-group-count,\n";
$css .= "body.theme-$id #page_content .mqttgw-status-detail, .theme-$id #page_content .mqttgw-status-detail,\n";
$css .= "body.theme-$id #page_content .mqttgw-status-uptime, .theme-$id #page_content .mqttgw-status-uptime,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-count, .theme-$id #page_content .mqttgw-traffic-count,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-topic, .theme-$id #page_content .mqttgw-traffic-topic,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-ms-label, .theme-$id #page_content .mqttgw-traffic-ms-label,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-time, .theme-$id #page_content .mqttgw-traffic-time,\n";
$css .= "body.theme-$id #page_content .mqttgw-traffic-proc, .theme-$id #page_content .mqttgw-traffic-proc {\n";
$css .= "  color: var(--lb-text-secondary, var(--lb-text, inherit)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";

$css .= "body.theme-$id #page_content .topic, .theme-$id #page_content .topic,\n";
$css .= "body.theme-$id #page_content .topic_time, .theme-$id #page_content .topic_time,\n";
$css .= "body.theme-$id #page_content .trans_table, .theme-$id #page_content .trans_table,\n";
$css .= "body.theme-$id #page_content .trans_table td, .theme-$id #page_content .trans_table td,\n";
$css .= "body.theme-$id #page_content .trans_table th, .theme-$id #page_content .trans_table th {\n";
$css .= "  color: var(--lb-text, inherit) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id #page_content .topic_payload, .theme-$id #page_content .topic_payload {\n";
$css .= "  color: var(--lb-primary, var(--lb-text, inherit)) !important;\n";
$css .= "}\n";

$css .= "/* V422: Generated LBV4 card content text compatibility. */\n";
$css .= "body.theme-$id .lb-card, .theme-$id .lb-card,\n";
$css .= "body.theme-$id .lb-card .lb-card-body, .theme-$id .lb-card .lb-card-body,\n";
$css .= "body.theme-$id .lb-card .lb-form-row, .theme-$id .lb-card .lb-form-row,\n";
$css .= "body.theme-$id .lb-card .lb-form-field, .theme-$id .lb-card .lb-form-field,\n";
$css .= "body.theme-$id .lb-card .lb-form-value, .theme-$id .lb-card .lb-form-value,\n";
$css .= "body.theme-$id .lb-card p, .theme-$id .lb-card p,\n";
$css .= "body.theme-$id .lb-card li, .theme-$id .lb-card li,\n";
$css .= "body.theme-$id .lb-card small, .theme-$id .lb-card small {\n";
$css .= "  color: var(--lb-card-text, var(--lb-text, inherit)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "\n/* DESIGN STUDIO RULES START */\n";
$css .= "/* V188: Table border width/color apply to the complete outer frame. Cell separators remain thin and do not cover the outer frame. */\n";
$css .= "body.theme-$id table.lb-table, body.theme-$id .lb-table,\n";
$css .= ".theme-$id table.lb-table, .theme-$id .lb-table {\n";
$css .= "  background-color: var(--lb-table-bg, var(--lb-table-row-bg, transparent));\n";
$css .= "  color: var(--lb-table-text, var(--lb-table-row-text, inherit));\n";
$css .= "  border-color: var(--lb-table-border-color, var(--lb-table-border, var(--lb-border-color, rgba(0,0,0,.16)))) !important;\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-width: var(--lb-table-outer-border-width, var(--lb-table-border-width, 1px)) !important;\n";
$css .= "  border-radius: var(--lb-table-radius, var(--lb-radius-table, 0px)) !important;\n";
$css .= "  border-collapse: separate !important;\n";
$css .= "  border-spacing: 0 !important;\n";
$css .= "  overflow: hidden;\n";
$css .= "}\n";
$css .= "body.theme-$id table.lb-table thead, body.theme-$id table.lb-table th, body.theme-$id .lb-table thead, body.theme-$id .lb-table th,\n";
$css .= ".theme-$id table.lb-table thead, .theme-$id table.lb-table th, .theme-$id .lb-table thead, .theme-$id .lb-table th {\n";
$css .= "  background-color: var(--lb-table-header-bg, var(--lb-table-bg, transparent));\n";
$css .= "  color: var(--lb-table-header-text, var(--lb-table-text, inherit));\n";
$css .= "  border-color: var(--lb-table-header-border-color, var(--lb-table-header-border, var(--lb-table-border-color, var(--lb-table-border, rgba(0,0,0,.16)))));\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-width: 0 var(--lb-table-cell-border-width, 1px) var(--lb-table-cell-border-width, 1px) 0 !important;\n";
$css .= "}\n";
$css .= "body.theme-$id table.lb-table td, body.theme-$id .lb-table td,\n";
$css .= ".theme-$id table.lb-table td, .theme-$id .lb-table td {\n";
$css .= "  background-color: var(--lb-table-row-bg, var(--lb-table-bg, transparent));\n";
$css .= "  color: var(--lb-table-row-text, var(--lb-table-text, inherit));\n";
$css .= "  border-color: var(--lb-table-row-border-color, var(--lb-table-row-border, var(--lb-table-border-color, var(--lb-table-border, rgba(0,0,0,.16)))));\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-width: 0 var(--lb-table-cell-border-width, 1px) var(--lb-table-cell-border-width, 1px) 0 !important;\n";
$css .= "}\n";
$css .= "/* V532: Semantic table cell foregrounds override the older generic lb-table helper. */\n";
$css .= "body.theme-$id table.lb-table .lb-table-header-cell, body.theme-$id .lb-table .lb-table-header-cell,\n";
$css .= ".theme-$id table.lb-table .lb-table-header-cell, .theme-$id .lb-table .lb-table-header-cell {\n";
$css .= "  color: var(--lb-table-header-text, var(--lb-table-text, inherit)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id table.lb-table .lb-table-cell, body.theme-$id .lb-table .lb-table-cell,\n";
$css .= ".theme-$id table.lb-table .lb-table-cell, .theme-$id .lb-table .lb-table-cell {\n";
$css .= "  color: var(--lb-table-row-text, var(--lb-table-text, inherit)) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id table.lb-table tr > th:last-child, body.theme-$id table.lb-table tr > td:last-child, body.theme-$id .lb-table tr > th:last-child, body.theme-$id .lb-table tr > td:last-child,\n";
$css .= ".theme-$id table.lb-table tr > th:last-child, .theme-$id table.lb-table tr > td:last-child, .theme-$id .lb-table tr > th:last-child, .theme-$id .lb-table tr > td:last-child {\n";
$css .= "  border-right-width: 0 !important;\n";
$css .= "}\n";
$css .= "body.theme-$id table.lb-table tbody tr:last-child > td, body.theme-$id table.lb-table tfoot tr:last-child > td, body.theme-$id .lb-table tbody tr:last-child > td, body.theme-$id .lb-table tfoot tr:last-child > td,\n";
$css .= ".theme-$id table.lb-table tbody tr:last-child > td, .theme-$id table.lb-table tfoot tr:last-child > td, .theme-$id .lb-table tbody tr:last-child > td, .theme-$id .lb-table tfoot tr:last-child > td {\n";
$css .= "  border-bottom-width: 0 !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-btn-group, .theme-$id .lb-btn-group {\n";
$css .= "  border: 1px solid var(--lb-input-border, var(--lb-btn-group-border, var(--lb-btn-group-inactive-border, var(--lb-border-color, var(--lb-border, #d7e7d9))))) !important;\n";
$css .= "  border-radius: var(--lb-btn-group-radius, var(--lb-btn-radius, var(--lb-radius-button, var(--lb-radius-sm, 10px)))) !important;\n";
$css .= "  overflow: hidden !important;\n";
$css .= "  box-sizing: border-box !important;\n";
$css .= "  display: inline-flex !important;\n";
$css .= "  align-items: stretch !important;\n";
$css .= "  background-clip: padding-box !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-btn-group button:not(.ui-btn-active):not(.lb-active):not(.is-active),\n";
$css .= "body.theme-$id .lb-btn-group .ui-btn:not(.ui-btn-active):not(.lb-active):not(.is-active),\n";
$css .= ".theme-$id .lb-btn-group button:not(.ui-btn-active):not(.lb-active):not(.is-active),\n";
$css .= ".theme-$id .lb-btn-group .ui-btn:not(.ui-btn-active):not(.lb-active):not(.is-active) {\n";
$css .= "  background-color: var(--lb-btn-group-inactive-bg, var(--lb-btn-group-active-text, #fff)) !important;\n";
$css .= "  color: var(--lb-btn-group-inactive-text, var(--lb-btn-group-active-bg, var(--lb-active-bg, #007aff))) !important;\n";
$css .= "  border-color: var(--lb-btn-group-inactive-border, var(--lb-btn-group-border, var(--lb-border-color, var(--lb-border, #d7e7d9)))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-btn-group button:not(.ui-btn-active):not(.lb-active):not(.is-active):hover,\n";
$css .= "body.theme-$id .lb-btn-group .ui-btn:not(.ui-btn-active):not(.lb-active):not(.is-active):hover,\n";
$css .= ".theme-$id .lb-btn-group button:not(.ui-btn-active):not(.lb-active):not(.is-active):hover,\n";
$css .= ".theme-$id .lb-btn-group .ui-btn:not(.ui-btn-active):not(.lb-active):not(.is-active):hover {\n";
$css .= "  background-color: var(--lb-btn-group-hover-bg, var(--lb-btn-group-active-bg, var(--lb-active-bg, #007aff))) !important;\n";
$css .= "  color: var(--lb-btn-group-hover-text, var(--lb-btn-group-active-text, var(--lb-active-text, #fff))) !important;\n";
$css .= "  border-color: var(--lb-btn-group-inactive-border, var(--lb-btn-group-border, var(--lb-border-color, var(--lb-border, #d7e7d9)))) !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "  filter: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-btn-group button.ui-btn-active,\n";
$css .= "body.theme-$id .lb-btn-group button.lb-active,\n";
$css .= "body.theme-$id .lb-btn-group button.is-active,\n";
$css .= "body.theme-$id .lb-btn-group .ui-btn.ui-btn-active,\n";
$css .= "body.theme-$id .lb-btn-group .ui-btn.lb-active,\n";
$css .= "body.theme-$id .lb-btn-group .ui-btn.is-active,\n";
$css .= ".theme-$id .lb-btn-group button.ui-btn-active,\n";
$css .= ".theme-$id .lb-btn-group button.lb-active,\n";
$css .= ".theme-$id .lb-btn-group button.is-active,\n";
$css .= ".theme-$id .lb-btn-group .ui-btn.ui-btn-active,\n";
$css .= ".theme-$id .lb-btn-group .ui-btn.lb-active,\n";
$css .= ".theme-$id .lb-btn-group .ui-btn.is-active {\n";
$css .= "  background-color: var(--lb-btn-group-active-bg, var(--lb-active-bg, #007aff)) !important;\n";
$css .= "  color: var(--lb-btn-group-active-text, var(--lb-active-text, #fff)) !important;\n";
$css .= "  border-color: var(--lb-btn-group-inactive-border, var(--lb-btn-group-border, var(--lb-border-color, var(--lb-border, #d7e7d9)))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-btn-group input:checked + label, .theme-$id .lb-btn-group input:checked + label {\n";
$css .= "  background-color: var(--lb-btn-group-active-bg, var(--lb-active-bg, #007aff)) !important;\n";
$css .= "  color: var(--lb-btn-group-active-text, var(--lb-active-text, #fff)) !important;\n";
$css .= "  border-color: var(--lb-btn-group-inactive-border, var(--lb-btn-group-border, var(--lb-border-color, var(--lb-border, #d7e7d9)))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-btn-group input:not(:checked) + label, .theme-$id .lb-btn-group input:not(:checked) + label {\n";
$css .= "  background-color: var(--lb-btn-group-inactive-bg, var(--lb-btn-group-active-text, #fff)) !important;\n";
$css .= "  color: var(--lb-btn-group-inactive-text, var(--lb-btn-group-active-bg, var(--lb-active-bg, #007aff))) !important;\n";
$css .= "  border-color: var(--lb-btn-group-inactive-border, var(--lb-btn-group-border, var(--lb-border-color, var(--lb-border, #d7e7d9)))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-btn-group > a, body.theme-$id .lb-btn-group > label, body.theme-$id .lb-btn-group > button, body.theme-$id .lb-btn-group > .ui-btn,\n";
$css .= ".theme-$id .lb-btn-group > a, .theme-$id .lb-btn-group > label, .theme-$id .lb-btn-group > button, .theme-$id .lb-btn-group > .ui-btn {\n";
$css .= "  border: 0 !important;\n";
$css .= "  border-right: 1px solid var(--lb-input-border, var(--lb-btn-group-border, var(--lb-btn-group-inactive-border, var(--lb-border-color, var(--lb-border, #d7e7d9))))) !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-btn-group > a:last-child, body.theme-$id .lb-btn-group > label:last-child, body.theme-$id .lb-btn-group > button:last-child, body.theme-$id .lb-btn-group > .ui-btn:last-child,\n";
$css .= ".theme-$id .lb-btn-group > a:last-child, .theme-$id .lb-btn-group > label:last-child, .theme-$id .lb-btn-group > button:last-child, .theme-$id .lb-btn-group > .ui-btn:last-child {\n";
$css .= "  border-right: 0 !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-btn-group > a.ui-btn-active, body.theme-$id .lb-btn-group > a.lb-active, body.theme-$id .lb-btn-group > a.is-active,\n";
$css .= "body.theme-$id .lb-btn-group > label.ui-btn-active, body.theme-$id .lb-btn-group > label.lb-active, body.theme-$id .lb-btn-group > label.is-active,\n";
$css .= "body.theme-$id .lb-btn-group > button.ui-btn-active, body.theme-$id .lb-btn-group > button.lb-active, body.theme-$id .lb-btn-group > button.is-active,\n";
$css .= ".theme-$id .lb-btn-group > a.ui-btn-active, .theme-$id .lb-btn-group > a.lb-active, .theme-$id .lb-btn-group > a.is-active,\n";
$css .= ".theme-$id .lb-btn-group > label.ui-btn-active, .theme-$id .lb-btn-group > label.lb-active, .theme-$id .lb-btn-group > label.is-active,\n";
$css .= ".theme-$id .lb-btn-group > button.ui-btn-active, .theme-$id .lb-btn-group > button.lb-active, .theme-$id .lb-btn-group > button.is-active {\n";
$css .= "  background-color: var(--lb-btn-group-active-bg, var(--lb-active-bg, #007aff)) !important;\n";
$css .= "  color: var(--lb-btn-group-active-text, var(--lb-active-text, #fff)) !important;\n";
$css .= "  border-color: var(--lb-btn-group-inactive-border, var(--lb-btn-group-border, var(--lb-border-color, var(--lb-border, #d7e7d9)))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-btn-group input:not(:checked) + label:hover, .theme-$id .lb-btn-group input:not(:checked) + label:hover {\n";
$css .= "  background-color: var(--lb-btn-group-hover-bg, var(--lb-btn-group-active-bg, var(--lb-active-bg, #007aff))) !important;\n";
$css .= "  color: var(--lb-btn-group-hover-text, var(--lb-btn-group-active-text, var(--lb-active-text, #fff))) !important;\n";
$css .= "  border-color: var(--lb-btn-group-inactive-border, var(--lb-btn-group-border, var(--lb-border-color, var(--lb-border, #d7e7d9)))) !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "  filter: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-toggle, .theme-$id .lb-toggle {\n";
$css .= "  border-radius: var(--lb-switch-radius, var(--lb-toggle-radius, var(--lb-toggle-slider-radius, 999px))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-toggle .lb-toggle-slider, body.theme-$id .lb-toggle input:not(:checked) + .lb-toggle-slider, .theme-$id .lb-toggle .lb-toggle-slider, .theme-$id .lb-toggle input:not(:checked) + .lb-toggle-slider {\n";
$css .= "  background-color: var(--lb-switch-off-bg, var(--lb-toggle-bg, rgba(0,0,0,.22))) !important;\n";
$css .= "  border-color: var(--lb-switch-border, var(--lb-toggle-border, var(--lb-border-color, rgba(0,0,0,.18)))) !important;\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-width: 1px !important;\n";
$css .= "  border-radius: var(--lb-switch-radius, var(--lb-toggle-radius, var(--lb-toggle-slider-radius, 999px))) !important;\n";
$css .= "  box-sizing: border-box !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-toggle input:checked + .lb-toggle-slider, .theme-$id .lb-toggle input:checked + .lb-toggle-slider {\n";
$css .= "  background-color: var(--lb-switch-on-bg, var(--lb-toggle-active-bg, var(--lb-active-bg, var(--lb-primary, #007aff)))) !important;\n";
$css .= "  border-color: var(--lb-switch-border, var(--lb-toggle-border, var(--lb-border-color, rgba(0,0,0,.18)))) !important;\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-width: 1px !important;\n";
$css .= "  border-radius: var(--lb-switch-radius, var(--lb-toggle-radius, var(--lb-toggle-slider-radius, 999px))) !important;\n";
$css .= "  box-sizing: border-box !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-toggle .lb-toggle-slider:before, body.theme-$id .lb-toggle .lb-toggle-slider:after, .theme-$id .lb-toggle .lb-toggle-slider:before, .theme-$id .lb-toggle .lb-toggle-slider:after {\n";
$css .= "  background-color: var(--lb-switch-thumb-bg, var(--lb-toggle-thumb-bg, var(--lb-toggle-knob-bg, #fff))) !important;\n";
$css .= "  border-radius: var(--lb-toggle-thumb-radius, var(--lb-toggle-knob-radius, var(--lb-switch-radius, 999px))) !important;\n";
$css .= "  top: 50% !important;\n";
$css .= "  bottom: auto !important;\n";
$css .= "  translate: 0 -50% !important;\n";
$css .= "}\n";
$css .= "body.theme-$id input[type=checkbox], .theme-$id input[type=checkbox] {\n";
$css .= "  accent-color: var(--lb-checkbox-checked-bg, var(--lb-primary, var(--lb-active-bg, #007aff))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id input[type=radio], .theme-$id input[type=radio] {\n";
$css .= "  accent-color: var(--lb-radio-checked-bg, var(--lb-primary, var(--lb-active-bg, #007aff))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-slider, .theme-$id .lb-slider {\n";
$css .= "  /* V225: prefer explicit slider tokens; older themes fall back to their own active/button/primary color. */\n";
$css .= "  accent-color: var(--lb-slider-fill-bg, var(--lb-slider-active-bg, var(--lb-range-active-bg, var(--lb-active-bg, var(--lb-btn-primary-bg, var(--lb-primary, #007aff)))))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-slider::-webkit-slider-runnable-track, .theme-$id .lb-slider::-webkit-slider-runnable-track {\n";
$css .= "  height: var(--lb-slider-track-height, var(--lb-range-track-height, 6px)) !important;\n";
$css .= "  min-height: 0 !important;\n";
$css .= "  border-radius: var(--lb-slider-track-radius, 999px) !important;\n";
$css .= "  box-sizing: border-box !important;\n";
$css .= "  background: linear-gradient(to right, var(--lb-slider-fill-bg, var(--lb-slider-active-bg, var(--lb-range-active-bg, var(--lb-active-bg, var(--lb-btn-primary-bg, var(--lb-primary, #007aff)))))) 0%, var(--lb-slider-fill-bg, var(--lb-slider-active-bg, var(--lb-range-active-bg, var(--lb-active-bg, var(--lb-btn-primary-bg, var(--lb-primary, #007aff)))))) var(--lb-slider-fill, 50%), var(--lb-slider-track-bg, var(--lb-slider-bg, rgba(0,0,0,.22))) var(--lb-slider-fill, 50%), var(--lb-slider-track-bg, var(--lb-slider-bg, rgba(0,0,0,.22))) 100%) !important;\n";
$css .= "  border-color: var(--lb-slider-border, var(--lb-border-color, rgba(0,0,0,.18))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-slider::-moz-range-track, .theme-$id .lb-slider::-moz-range-track {\n";
$css .= "  height: var(--lb-slider-track-height, var(--lb-range-track-height, 6px)) !important;\n";
$css .= "  min-height: 0 !important;\n";
$css .= "  border-radius: var(--lb-slider-track-radius, 999px) !important;\n";
$css .= "  box-sizing: border-box !important;\n";
$css .= "  background-color: var(--lb-slider-track-bg, var(--lb-slider-bg, rgba(0,0,0,.22))) !important;\n";
$css .= "  border-color: var(--lb-slider-border, var(--lb-border-color, rgba(0,0,0,.18))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-slider::-moz-range-progress, .theme-$id .lb-slider::-moz-range-progress {\n";
$css .= "  height: var(--lb-slider-track-height, var(--lb-range-track-height, 6px)) !important;\n";
$css .= "  min-height: 0 !important;\n";
$css .= "  border-radius: var(--lb-slider-track-radius, 999px) !important;\n";
$css .= "  background-color: var(--lb-slider-fill-bg, var(--lb-slider-active-bg, var(--lb-range-active-bg, var(--lb-active-bg, var(--lb-btn-primary-bg, var(--lb-primary, #007aff)))))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-slider::-webkit-slider-thumb, .theme-$id .lb-slider::-webkit-slider-thumb {\n";
$css .= "  margin-top: var(--lb-slider-thumb-offset, calc((var(--lb-slider-track-height, var(--lb-range-track-height, 6px)) - var(--lb-slider-thumb-size, 20px)) / 2)) !important;\n";
$css .= "  width: var(--lb-slider-thumb-size, 20px) !important;\n";
$css .= "  height: var(--lb-slider-thumb-size, 20px) !important;\n";
$css .= "  background-color: var(--lb-slider-thumb-bg, var(--lb-slider-fill-bg, var(--lb-slider-active-bg, var(--lb-range-active-bg, var(--lb-active-bg, var(--lb-btn-primary-bg, var(--lb-primary, #007aff))))))) !important;\n";
$css .= "  border-width: var(--lb-slider-thumb-border-width, 3px) !important;\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-color: var(--lb-slider-thumb-border-color, var(--lb-slider-thumb-border, #ffffff)) !important;\n";
$css .= "  box-shadow: var(--lb-slider-thumb-shadow, 0 1px 5px rgba(0,0,0,.25)) !important;\n";
$css .= "  box-sizing: border-box !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-slider::-moz-range-thumb, .theme-$id .lb-slider::-moz-range-thumb {\n";
$css .= "  width: var(--lb-slider-thumb-size, 20px) !important;\n";
$css .= "  height: var(--lb-slider-thumb-size, 20px) !important;\n";
$css .= "  background-color: var(--lb-slider-thumb-bg, var(--lb-slider-fill-bg, var(--lb-slider-active-bg, var(--lb-range-active-bg, var(--lb-active-bg, var(--lb-btn-primary-bg, var(--lb-primary, #007aff))))))) !important;\n";
$css .= "  border-width: var(--lb-slider-thumb-border-width, 3px) !important;\n";
$css .= "  border-style: solid !important;\n";
$css .= "  border-color: var(--lb-slider-thumb-border-color, var(--lb-slider-thumb-border, #ffffff)) !important;\n";
$css .= "  box-shadow: var(--lb-slider-thumb-shadow, 0 1px 5px rgba(0,0,0,.25)) !important;\n";
$css .= "  box-sizing: border-box !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-slider::-webkit-slider-thumb:hover, .theme-$id .lb-slider::-webkit-slider-thumb:hover, body.theme-$id .lb-slider::-moz-range-thumb:hover, .theme-$id .lb-slider::-moz-range-thumb:hover {\n";
$css .= "  box-shadow: var(--lb-slider-thumb-hover-shadow, 0 0 0 7px var(--lb-focus-ring-strong, rgba(37,99,235,.18)), var(--lb-slider-thumb-shadow, 0 1px 5px rgba(0,0,0,.25))) !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .lb-tooltip, body.theme-$id [role=tooltip], .theme-$id .lb-tooltip, .theme-$id [role=tooltip] {\n";
$css .= "  background-color: var(--lb-tooltip-bg, var(--lb-primary-hover, #2e8b57)) !important;\n";
$css .= "  color: var(--lb-tooltip-text, var(--lb-sidebar-text, #fff)) !important;\n";
$css .= "}\n";

$css .= "/* V514: Native form controls are Core-owned. */\n";
$css .= "/* No generated input/select/textarea border, radius, shadow, focus or appearance rules. */\n";
$css .= "/* DESIGN STUDIO RULES END */\n";

$css .= "\n/* DESIGN STUDIO CORE WIDGET LABEL COMPAT START */\n";
$css .= "/* V416: Core plugin/system widget labels follow the generated theme text tokens. */\n";
$css .= "body.theme-$id .widget a.nolinkstyle,\n";
$css .= "body.theme-$id .widget a.nolinkstyle:link,\n";
$css .= "body.theme-$id .widget a.nolinkstyle:visited,\n";
$css .= ".theme-$id .widget a.nolinkstyle,\n";
$css .= ".theme-$id .widget a.nolinkstyle:link,\n";
$css .= ".theme-$id .widget a.nolinkstyle:visited {\n";
$css .= "  color: var(--lb-text, inherit) !important;\n";
$css .= "  -webkit-text-fill-color: var(--lb-text, inherit) !important;\n";
$css .= "  text-shadow: none !important;\n";
$css .= "}\n";
$css .= "body.theme-$id .widget a.nolinkstyle:hover,\n";
$css .= "body.theme-$id .widget a.nolinkstyle:focus-visible,\n";
$css .= ".theme-$id .widget a.nolinkstyle:hover,\n";
$css .= ".theme-$id .widget a.nolinkstyle:focus-visible {\n";
$css .= "  color: var(--lb-primary-hover, var(--lb-primary, var(--lb-text, inherit))) !important;\n";
$css .= "  -webkit-text-fill-color: var(--lb-primary-hover, var(--lb-primary, var(--lb-text, inherit))) !important;\n";
$css .= "}\n";
$css .= "/* DESIGN STUDIO CORE WIDGET LABEL COMPAT END */\n";

$css .= "\n/* DESIGN STUDIO LEGACY CONTENT TRANSPARENCY START */\n";
$css .= "/* V367: Default legacy content/form surfaces are always transparent. */\n";
$css .= "html body.theme-$id #page_content,\n";
$css .= "html body.theme-$id #page_content.page_content,\n";
$css .= "html body.theme-$id #page_content.lb-content,\n";
$css .= "html body.theme-$id #page_content.ui-content,\n";
$css .= "html body.theme-$id .page_content,\n";
$css .= "html body.theme-$id .lb-content,\n";
$css .= "body.theme-$id #page_content, body.theme-$id .page_content, body.theme-$id .lb-content,\n";
$css .= ".theme-$id #page_content, .theme-$id .page_content, .theme-$id .lb-content,\n";
$css .= "html body.theme-$id #page_content > form,\n";
$css .= "html body.theme-$id #page_content form,\n";
$css .= "html body.theme-$id #page_content > form > div.form-group,\n";
$css .= "html body.theme-$id #page_content form div.form-group,\n";
$css .= "body.theme-$id #page_content form, body.theme-$id #page_content div.form-group,\n";
$css .= ".theme-$id #page_content form, .theme-$id #page_content div.form-group,\n";
$css .= "html body.theme-$id #page_content table.formtable,\n";
$css .= "html body.theme-$id #page_content table.formtable > thead,\n";
$css .= "html body.theme-$id #page_content table.formtable > tbody,\n";
$css .= "html body.theme-$id #page_content table.formtable > tfoot,\n";
$css .= "html body.theme-$id #page_content table.formtable > thead > tr,\n";
$css .= "html body.theme-$id #page_content table.formtable > tbody > tr,\n";
$css .= "html body.theme-$id #page_content table.formtable > tfoot > tr,\n";
$css .= "html body.theme-$id #page_content table.formtable > thead > tr > th,\n";
$css .= "html body.theme-$id #page_content table.formtable > thead > tr > td,\n";
$css .= "html body.theme-$id #page_content table.formtable > tbody > tr > th,\n";
$css .= "html body.theme-$id #page_content table.formtable > tbody > tr > td,\n";
$css .= "html body.theme-$id #page_content table.formtable > tfoot > tr > th,\n";
$css .= "html body.theme-$id #page_content table.formtable > tfoot > tr > td,\n";
$css .= "body.theme-$id table.formtable,\n";
$css .= "body.theme-$id table.formtable > thead, body.theme-$id table.formtable > tbody, body.theme-$id table.formtable > tfoot,\n";
$css .= "body.theme-$id table.formtable > thead > tr, body.theme-$id table.formtable > tbody > tr, body.theme-$id table.formtable > tfoot > tr,\n";
$css .= "body.theme-$id table.formtable > thead > tr > th, body.theme-$id table.formtable > thead > tr > td,\n";
$css .= "body.theme-$id table.formtable > tbody > tr > th, body.theme-$id table.formtable > tbody > tr > td,\n";
$css .= "body.theme-$id table.formtable > tfoot > tr > th, body.theme-$id table.formtable > tfoot > tr > td,\n";
$css .= ".theme-$id table.formtable,\n";
$css .= ".theme-$id table.formtable > thead, .theme-$id table.formtable > tbody, .theme-$id table.formtable > tfoot,\n";
$css .= ".theme-$id table.formtable > thead > tr, .theme-$id table.formtable > tbody > tr, .theme-$id table.formtable > tfoot > tr,\n";
$css .= ".theme-$id table.formtable > thead > tr > th, .theme-$id table.formtable > thead > tr > td,\n";
$css .= ".theme-$id table.formtable > tbody > tr > th, .theme-$id table.formtable > tbody > tr > td,\n";
$css .= ".theme-$id table.formtable > tfoot > tr > th, .theme-$id table.formtable > tfoot > tr > td {\n";
$css .= "  background: transparent !important;\n";
$css .= "  background-color: transparent !important;\n";
$css .= "  background-image: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  backdrop-filter: none !important;\n";
$css .= "  -webkit-backdrop-filter: none !important;\n";
$css .= "}\n";
$css .= "/* V433: The historical LoxBerry form wrapper is a pure layout wrapper.\n";
$css .= "   Its FONT placeholder and every structural descendant must never become\n";
$css .= "   a card/table surface through generic theme rules. Real controls keep\n";
$css .= "   their own component styling. */\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable),\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> font + table.formtable),\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> font + table.formtable) > font,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> font + table.formtable) > table.formtable,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > thead,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > tbody,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > tfoot,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > thead > tr,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > tbody > tr,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > tfoot > tr,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > thead > tr > th,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > thead > tr > td,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > tbody > tr > th,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > tbody > tr > td,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > tfoot > tr > th,\n";
$css .= "html body.theme-$id #page_content div.form-group:has(> table.formtable) > table.formtable > tfoot > tr > td {\n";
$css .= "  background: transparent !important;\n";
$css .= "  background-color: transparent !important;\n";
$css .= "  background-image: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  backdrop-filter: none !important;\n";
$css .= "  -webkit-backdrop-filter: none !important;\n";
$css .= "}\n";

$css .= "/* V435: Legacy layout-row transparency invariant. */\n";
$css .= "html body.theme-$id #page_content [data-role='fieldcontain'],\n";
$css .= "html body.theme-$id #page_content .ui-field-contain,\n";
$css .= "html body.theme-$id #page_content .ui-field-contain > div:not(.ui-input-text):not(.ui-input-search):not(.ui-textinput):not(.ui-select):not(.ui-slider):not(.ui-slider-track):not(.ui-controlgroup):not(.ui-controlgroup-controls):not(.ui-checkbox):not(.ui-radio):not(.ui-flipswitch):not(.lb-input):not(.lb-select):not(.lb-textarea),\n";
$css .= "html body.theme-$id #page_content table.formtable td > div:not(.lb-card):not(.lb-panel):not(.lb-modal):not(.lb-tooltip):not(.lb-alert):not(.ui-input-text):not(.ui-input-search):not(.ui-textinput):not(.ui-select):not(.ui-slider):not(.ui-slider-track):not(.ui-controlgroup):not(.ui-controlgroup-controls):not(.ui-checkbox):not(.ui-radio):not(.ui-flipswitch):not(.lb-input):not(.lb-select):not(.lb-textarea),\n";
$css .= "html body.theme-$id #page_content table.formtable th > div:not(.lb-card):not(.lb-panel):not(.lb-modal):not(.lb-tooltip):not(.lb-alert):not(.ui-input-text):not(.ui-input-search):not(.ui-textinput):not(.ui-select):not(.ui-slider):not(.ui-slider-track):not(.ui-controlgroup):not(.ui-controlgroup-controls):not(.ui-checkbox):not(.ui-radio):not(.ui-flipswitch):not(.lb-input):not(.lb-select):not(.lb-textarea),\n";
$css .= "html body.theme-$id #page_content div.form-group > div:not(.lb-card):not(.lb-panel):not(.lb-modal):not(.lb-tooltip):not(.lb-alert):not(.ui-input-text):not(.ui-input-search):not(.ui-textinput):not(.ui-select):not(.ui-slider):not(.ui-slider-track):not(.ui-controlgroup):not(.ui-controlgroup-controls):not(.ui-checkbox):not(.ui-radio):not(.ui-flipswitch):not(.lb-input):not(.lb-select):not(.lb-textarea),\n";
$css .= "body.theme-$id #page_content [data-role='fieldcontain'],\n";
$css .= "body.theme-$id #page_content .ui-field-contain,\n";
$css .= ".theme-$id #page_content [data-role='fieldcontain'],\n";
$css .= ".theme-$id #page_content .ui-field-contain {\n";
$css .= "  background: transparent !important;\n";
$css .= "  background-color: transparent !important;\n";
$css .= "  background-image: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  backdrop-filter: none !important;\n";
$css .= "  -webkit-backdrop-filter: none !important;\n";
$css .= "}\n";

$css .= "/* V528: Legacy formtable-container transparency invariant. */\n";
$css .= "html body.theme-$id #page_content table.formtable-container,\n";
$css .= "html body.theme-$id #page_content table.formtable-container > :is(thead, tbody, tfoot),\n";
$css .= "html body.theme-$id #page_content table.formtable-container > :is(thead, tbody, tfoot) > tr,\n";
$css .= "html body.theme-$id #page_content table.formtable-container > :is(thead, tbody, tfoot) > tr > :is(th, td),\n";
$css .= "body.theme-$id table.formtable-container,\n";
$css .= "body.theme-$id table.formtable-container > :is(thead, tbody, tfoot),\n";
$css .= "body.theme-$id table.formtable-container > :is(thead, tbody, tfoot) > tr,\n";
$css .= "body.theme-$id table.formtable-container > :is(thead, tbody, tfoot) > tr > :is(th, td),\n";
$css .= ".theme-$id table.formtable-container,\n";
$css .= ".theme-$id table.formtable-container > :is(thead, tbody, tfoot),\n";
$css .= ".theme-$id table.formtable-container > :is(thead, tbody, tfoot) > tr,\n";
$css .= ".theme-$id table.formtable-container > :is(thead, tbody, tfoot) > tr > :is(th, td) {\n";
$css .= "  background: transparent !important;\n";
$css .= "  background-color: transparent !important;\n";
$css .= "  background-image: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  backdrop-filter: none !important;\n";
$css .= "  -webkit-backdrop-filter: none !important;\n";
$css .= "}\n";

$css .= "/* V436: Nested legacy layout-table transparency invariant. */\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table),\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > thead,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > tbody,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > tfoot,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > thead > tr,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > tbody > tr,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > tfoot > tr,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > thead > tr > th,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > thead > tr > td,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > tbody > tr > th,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > tbody > tr > td,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > tfoot > tr > th,\n";
$css .= "html body.theme-$id #page_content table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) > tfoot > tr > td,\n";
$css .= "body.theme-$id table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table),\n";
$css .= ".theme-$id table.formtable table:not(.lb-table):not(.dataTable):not(.ui-table) {\n";
$css .= "  background: transparent !important;\n";
$css .= "  background-color: transparent !important;\n";
$css .= "  background-image: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  backdrop-filter: none !important;\n";
$css .= "  -webkit-backdrop-filter: none !important;\n";
$css .= "}\n";

$css .= "/* V513: Actual control wrappers are excluded in the selectors above; no restorative override is required. */\n";
$css .= "/* DESIGN STUDIO LEGACY CONTENT TRANSPARENCY END */\n";

$css .= "/* V522: Legacy jQM inner text-input surface reset. */\n";
$css .= "html body.theme-$id #page_content#page_content .ui-input-text > input:not(.lb-input),\n";
$css .= "html body.theme-$id #page_content#page_content .ui-input-search > input:not(.lb-input),\n";
$css .= "html body.theme-$id #page_content#page_content .ui-textinput > input:not(.lb-input),\n";
$css .= "body.theme-$id .ui-input-text > input:not(.lb-input), body.theme-$id .ui-input-search > input:not(.lb-input), body.theme-$id .ui-textinput > input:not(.lb-input),\n";
$css .= ".theme-$id .ui-input-text > input:not(.lb-input), .theme-$id .ui-input-search > input:not(.lb-input), .theme-$id .ui-textinput > input:not(.lb-input) {\n";
$css .= "  border: 0 !important;\n";
$css .= "  border-width: 0 !important;\n";
$css .= "  border-style: none !important;\n";
$css .= "  border-radius: 0 !important;\n";
$css .= "  background: transparent !important;\n";
$css .= "  background-color: transparent !important;\n";
$css .= "  background-image: none !important;\n";
$css .= "  box-shadow: none !important;\n";
$css .= "  outline: 0 !important;\n";
$css .= "}\n";

my $json = JSON::PP->new->canonical->pretty->utf8->encode($editable);
my @writes = (@asset_writes, ["$theme_dir/$css_file", encode('UTF-8', $css), 0644], ["$config_root/$id.json", $json, 0600]);
eval { ThemeStudio::commit(\@writes); 1 }
    or ThemeStudio::error('500 Internal Server Error', 'saveFailed', 'Could not publish theme files');
my $saved = LoxBerry::Theme::get_theme($id);
ThemeStudio::response('200 OK', {
    ok => JSON::PP::true, id => $id, name => $name, version => $version, type => 'user',
    tokens => \%clean_tokens, custom_css => $custom_css, wallpaper => $wallpaper,
    revision => ThemeStudio::revision($saved),
    theme_json => "config/system/themes/$id.json", css => "data/system/themes/$css_file",
    public_css => LoxBerry::Theme::theme_css_url($id), css_written => JSON::PP::true,
});
