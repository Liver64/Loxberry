#!/usr/bin/perl
# LoxBerry Design-Studio - Version: 4.0.1.24
use strict;
use warnings;
use utf8;
use FindBin qw($Bin);
use lib "$Bin/lib";
use HTML::Template;
use CGI ();
use Encode qw(encode);
use JSON::PP ();
use LoxBerry::System ();
use LoxBerry::Web ();
use LoxBerry::Theme ();
use ThemeStudio ();
my $version = '4.0.1.24';
my ($language, $dictionary) = ThemeStudio::language();
my %files = (
    design_tokens => "$LoxBerry::System::lbshtmldir/css/design-tokens.css",
    components => "$LoxBerry::System::lbshtmldir/css/components.css",
);
my (%by_file, %tokens, @missing);
for my $key (qw(design_tokens components)) {
    if (!-f $files{$key}) { push @missing, $files{$key}; next; }
    $by_file{$key} = ThemeStudio::tokens(ThemeStudio::read_text($files{$key}));
}
# The design-token file defines the neutral baseline; component aliases only fill gaps.
for my $key (qw(components design_tokens)) { @tokens{keys %{$by_file{$key} || {}}} = values %{$by_file{$key} || {}}; }
# Studio aliases refer to the same semantic primary roles as native components.
my %aliases = (
    '--lb-active-bg' => 'var(--lb-btn-primary-bg, var(--lb-primary))',
    '--lb-active-text' => 'var(--lb-btn-primary-text)',
    '--lb-active-border' => 'var(--lb-btn-primary-border, var(--lb-primary-hover))',
    '--lb-hover-bg' => 'var(--lb-primary-hover)',
);
@tokens{keys %aliases} = values %aliases;
my $themes = ThemeStudio::registry();
my $active_tokens = {};
my $current = LoxBerry::Theme::current_theme();
if ($current) {
    my $registered = $current;
    $registered->{tokens} = ThemeStudio::tokens(ThemeStudio::read_text($current->{css_path})) if ref($registered->{tokens}) ne 'HASH';
    if ($registered) { $active_tokens = $registered->{tokens}; @tokens{keys %{$active_tokens}} = values %{$active_tokens}; }
}
# Missing component roles derive from the active theme rather than brand-color defaults.
my %semantic_defaults = (
    %aliases,
    '--lb-primary-dark' => 'var(--lb-primary-hover)',
    '--lb-content-bg' => 'var(--lb-bg)',
    '--lb-section-border' => 'var(--lb-primary)',
    '--lb-tab-bar-active' => 'var(--lb-primary)',
    '--lb-tooltip-bg' => 'var(--lb-primary-hover)',
    '--lb-tooltip-text' => 'var(--lb-btn-primary-text)',
    '--lb-sidebar-active-text' => 'var(--lb-btn-primary-text)',
    '--lb-btn-primary-border' => 'var(--lb-primary-hover)',
    '--lb-header-btn-hover-bg' => 'var(--lb-primary-hover)',
);
for my $name (keys %semantic_defaults) {
    if (exists $active_tokens->{$name}) { delete $semantic_defaults{$name}; next; }
    $tokens{$name} = $semantic_defaults{$name};
}
my $core_data = { active_theme_tokens => $active_tokens, semantic_defaults => \%semantic_defaults, files => \%files, tokens => \%tokens, tokens_by_file => \%by_file, themes => $themes, missing => \@missing };
my $template = HTML::Template->new(filename => "$LoxBerry::System::lbstemplatedir/themes.html", die_on_bad_params => 0, utf8 => 1);
$template->param(
    VERSION => $version, LBLANG => $language,
    LANGUAGE_JSON => ThemeStudio::json_script({ $language => $dictionary }),
    DEFAULT_THEME_JSON => ThemeStudio::json_script({ id => '', name => $dictionary->{GLOBAL_COLOR_NEW_THEME}, type => 'user', version => '0.1.0' }),
    CORE_DATA_JSON => ThemeStudio::json_script($core_data), CORE_TOKENS_JSON => ThemeStudio::json_script(\%tokens),
    USER_THEMES_JSON => ThemeStudio::json_script($themes), TOKEN_COUNT => scalar keys %tokens,
    MISSING_FILES => join(', ', @missing), HAS_MISSING_FILES => scalar @missing, USER_THEME_COUNT => scalar @{$themes},
);
our $helptext = encode('UTF-8', '<h2>Design-Studio</h2><p>' . CGI::escapeHTML($dictionary->{REGISTRY_HELP_TEXT}) . '</p>');
LoxBerry::Web::lbheader('Design-Studio', '', '', 1);
print encode('UTF-8', $template->output);
LoxBerry::Web::lbfooter();
