# LoxBerry CSS Studio - Version: 4.0.1.22
package ThemeStudio;
use strict;
use warnings;
use JSON::PP ();
use Encode qw(encode);
use Cwd qw(realpath);
use File::Path qw(make_path);
use File::Temp qw(tempfile);
use Fcntl qw(:DEFAULT :flock);
use Digest::SHA qw(sha256_hex);
use LoxBerry::System ();
use LoxBerry::Theme ();
our $VERSION = '4.0.1.22';
our $LOCK;

sub read_text {
    my ($path) = @_;
    open(my $fh, '<:encoding(UTF-8)', $path) or die "Cannot read $path: $!";
    local $/;
    my $text = <$fh>;
    close($fh) or die "Cannot close $path: $!";
    return $text // '';
}

sub tokens {
    my ($css) = @_;
    $css =~ s{/\*[\s\S]*?\*/}{}g;
    my %tokens;
    while ($css =~ /(--lb-[a-z0-9-]+)\s*:\s*([^;{}]+)\s*;/ig) {
        my ($key, $value) = ($1, $2);
        $value =~ s/^\s+|\s+$//g;
        $tokens{$key} = $value;
    }
    return \%tokens;
}

sub registry {
    my @themes;
    for my $theme (LoxBerry::Theme::list_themes()) {
        next if !$theme->{selectable} || $theme->{type} ne 'user';
        next if ref($theme->{studio}) eq 'HASH' && exists($theme->{studio}{visible}) && !$theme->{studio}{visible};
        my %public = %{$theme};
        delete @public{qw(config_path css_path)};
        $public{tokens} = $theme->{type} eq 'user' && ref($theme->{tokens}) eq 'HASH' ? $theme->{tokens} : tokens(read_text($theme->{css_path}));
        $public{custom_css} = '' if $theme->{type} eq 'core';
        $public{revision} = revision($theme);
        push @themes, \%public;
    }
    return \@themes;
}

sub revision {
    my ($theme) = @_;
    return '' if !$theme;
    return sha256_hex(encode('UTF-8', read_text($theme->{config_path}) . read_text($theme->{css_path})));
}

sub json_script {
    my ($value) = @_;
    my $json = JSON::PP->new->canonical->encode($value);
    $json =~ s/</\\u003c/g;
    $json =~ s/>/\\u003e/g;
    $json =~ s/&/\\u0026/g;
    $json =~ s/\x{2028}/\\u2028/g;
    $json =~ s/\x{2029}/\\u2029/g;
    return $json;
}

sub language {
    my $lang = LoxBerry::System::lblanguage() =~ /^de/i ? 'de' : 'en';
    my %dictionary;
    # These files use INI sections and JSON-escaped quoted string values.
    for my $code ('en', ($lang ne 'en' ? $lang : ())) {
        my $path = "$LoxBerry::System::lbstemplatedir/lang/help_themes_$code.ini";
        my $text = read_text($path);
        for my $line (split /\n/, $text) {
            next if $line !~ /^([A-Z][A-Z0-9_]*)=(".*")\s*$/;
            my ($key, $quoted) = ($1, $2);
            my $value = JSON::PP->new->decode($quoted);
            $dictionary{$key} = $value;
        }
    }
    return ($lang, \%dictionary);
}

sub response {
    my ($status, $payload) = @_;
    print "Status: $status\r\nContent-Type: application/json; charset=utf-8\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\n\r\n";
    print JSON::PP->new->utf8->canonical->encode($payload);
    exit;
}

sub error {
    my ($status, $key, $message) = @_;
    response($status, { ok => JSON::PP::false, error_key => $key, error => $message });
}

sub request {
    error('405 Method Not Allowed', 'methodNotAllowed', 'POST required') if ($ENV{REQUEST_METHOD} // '') ne 'POST';
    error('415 Unsupported Media Type', 'invalidJsonPayload', 'JSON required') if ($ENV{CONTENT_TYPE} // '') !~ m{\Aapplication/json(?:\s*;[^\r\n]*)?\z}i;
    # A custom header and no CORS permission prevent cross-origin form submissions.
    error('403 Forbidden', 'forbiddenOrigin', 'Invalid Studio request') if ($ENV{HTTP_X_LOXBERRY_STUDIO} // '') ne '1';
    error('403 Forbidden', 'forbiddenOrigin', 'Cross-site request rejected') if ($ENV{HTTP_SEC_FETCH_SITE} // '') eq 'cross-site';
    if (defined $ENV{HTTP_ORIGIN}) {
        my ($host) = $ENV{HTTP_ORIGIN} =~ m{\Ahttps?://([^/]+)\z}i;
        error('403 Forbidden', 'forbiddenOrigin', 'Cross-origin request rejected') if !defined $host || lc($host) ne lc($ENV{HTTP_HOST} // '');
    }
    my $length = $ENV{CONTENT_LENGTH} // '';
    error('400 Bad Request', 'invalidJsonPayload', 'Invalid content length') if $length !~ /\A[0-9]+\z/ || $length == 0;
    error('413 Payload Too Large', 'payloadTooLarge', 'Request exceeds 12 MiB') if $length > 12 * 1024 * 1024;
    binmode(STDIN);
    my $raw = '';
    while (length($raw) < $length) {
        my $got = read(STDIN, my $part, $length - length($raw));
        error('400 Bad Request', 'invalidJsonPayload', 'Incomplete request') if !defined $got || !$got;
        $raw .= $part;
    }
    my $data = eval { JSON::PP->new->utf8->decode($raw) };
    error('400 Bad Request', 'invalidJsonPayload', 'Invalid JSON object') if $@ || ref($data) ne 'HASH';
    return $data;
}

sub valid_id {
    my ($id) = @_;
    return defined($id) && !ref($id) && $id =~ /\A[a-z0-9][a-z0-9-]{0,63}\z/;
}

sub user_roots {
    my $config = "$LoxBerry::System::lbsconfigdir/themes";
    my $data = "$LoxBerry::System::lbsdatadir/themes";
    for my $dir ($config, $data) {
        make_path($dir, { mode => 0755 }) if !-d $dir;
        die "Unsafe user theme directory" if -l $dir || !-d $dir;
        my $parent = realpath($dir . '/..');
        my $resolved = realpath($dir);
        die "Unsafe user theme directory" if !defined $parent || !defined $resolved || $resolved ne "$parent/themes";
    }
    return ($config, $data);
}

sub lock {
    my ($config) = user_roots();
    my $path = "$config/.studio.lock";
    die 'Unsafe Studio lock' if -l $path;
    sysopen($LOCK, $path, O_CREAT | O_RDWR, 0600) or die "Cannot open Studio lock: $!";
    flock($LOCK, LOCK_EX) or die "Cannot lock Studio: $!";
    return $LOCK;
}

sub writable_theme {
    my ($id, $deleting) = @_;
    error('400 Bad Request', 'invalidThemeId', 'Invalid theme id') if !valid_id($id);
    # Reserved IDs remain protected independently of metadata files and CSS availability.
    error('403 Forbidden', 'REGISTRY_PROTECTED', 'Core themes are read-only') if LoxBerry::Theme::is_core_theme($id);
    my $theme = LoxBerry::Theme::get_theme($id);
    if ($theme && ref($theme->{studio}) eq 'HASH') {
        my $permission = $deleting ? 'deletable' : 'editable';
        error('403 Forbidden', 'REGISTRY_PROTECTED', 'Read-only theme') if ($theme->{studio}{mode} // '') eq 'readonly';
        error('403 Forbidden', 'REGISTRY_PROTECTED', 'Protected user theme') if exists $theme->{studio}{$permission} && !$theme->{studio}{$permission};
    }
    if ($deleting) {
        error('404 Not Found', 'themeNotFound', 'Theme is not registered') if !$theme;
        my $current = LoxBerry::Theme::current_theme();
        error('409 Conflict', 'REGISTRY_ACTIVE', 'The active theme cannot be deleted') if $current && $current->{id} eq $id;
    }
    my ($config, $data) = user_roots();
    for my $path ("$config/$id.json", "$data/theme-$id.css") {
        die 'Unsafe theme file' if -l $path;
        die 'Theme target is not a file' if -e $path && !-f $path;
    }
    return $theme;
}

sub safe_asset {
    my ($relative) = @_;
    die 'Invalid asset path' if $relative !~ m{\Aassets/(?:[A-Za-z0-9_-]+/)*[A-Za-z0-9_.-]+\z};
    my (undef, $root) = user_roots();
    my @parts = split '/', $relative;
    pop @parts;
    my $dir = $root;
    for my $part (@parts) {
        $dir .= "/$part";
        die 'Unsafe asset directory' if -l $dir;
        make_path($dir, { mode => 0755 }) if !-d $dir;
        die 'Unsafe asset directory' if !-d $dir;
    }
    my $path = "$root/$relative";
    die 'Unsafe asset file' if -l $path || (-e $path && !-f $path);
    return $path;
}

sub commit {
    my ($writes) = @_;
    my @staged;
    my @published;
    my $ok = eval {
        # Stage every file first. The registry JSON is always published last.
        for my $write (@{$writes}) {
            my ($target, $bytes, $mode) = @{$write};
            die 'Unsafe commit target' if -l $target || (-e $target && !-f $target);
            (my $dir = $target) =~ s{/[^/]+\z}{};
            my ($fh, $temp) = tempfile('.studio-XXXXXXXX', DIR => $dir, UNLINK => 0);
            push @staged, { target => $target, temp => $temp, old => undef };
            binmode($fh);
            print {$fh} $bytes or die "Cannot stage $target: $!";
            close($fh) or die "Cannot close $target: $!";
            chmod($mode, $temp) or die "Cannot set permissions: $!";
        }
        for my $item (@staged) {
            if (-f $item->{target}) {
                open(my $fh, '<:raw', $item->{target}) or die "Cannot snapshot target: $!";
                local $/;
                $item->{old} = <$fh>;
                close($fh) or die "Cannot close snapshot: $!";
                $item->{old_mode} = (stat($item->{target}))[2] & 0777;
            }
            rename($item->{temp}, $item->{target}) or die "Cannot publish $item->{target}: $!";
            push @published, $item;
        }
        1;
    };
    my $failure = $@;
    if (!$ok) {
        for my $item (reverse @published) {
            if (defined $item->{old}) {
                (my $dir = $item->{target}) =~ s{/[^/]+\z}{};
                my ($fh, $temp) = tempfile('.studio-rollback-XXXXXXXX', DIR => $dir, UNLINK => 0);
                binmode($fh);
                print {$fh} $item->{old} or die 'Cannot restore theme';
                close($fh) or die 'Cannot close restored theme';
                chmod($item->{old_mode}, $temp);
                rename($temp, $item->{target}) or die 'Cannot restore theme';
            } else { unlink($item->{target}) or die 'Cannot remove incomplete theme'; }
        }
    }
    unlink($_->{temp}) for grep { -f $_->{temp} } @staged;
    die $failure if !$ok;
    return 1;
}

sub delete_theme {
    my ($theme) = @_;
    my @moved;
    my $ok = eval {
        # Remove the registry entry first and retain both files until staging succeeds.
        for my $path ($theme->{config_path}, $theme->{css_path}) {
            (my $dir = $path) =~ s{/[^/]+\z}{};
            my ($fh, $temp) = tempfile('.studio-delete-XXXXXXXX', DIR => $dir, UNLINK => 0);
            close($fh);
            unlink($temp) or die 'Cannot prepare deletion';
            rename($path, $temp) or die "Cannot stage deletion: $!";
            push @moved, [$path, $temp];
        }
        1;
    };
    my $failure = $@;
    if (!$ok) { rename($_->[1], $_->[0]) or die 'Cannot restore deleted theme' for reverse @moved; die $failure; }
    unlink($_->[1]) or die 'Cannot finalize deletion' for @moved;
    return 1;
}
1;
