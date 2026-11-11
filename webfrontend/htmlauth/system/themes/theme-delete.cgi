#!/usr/bin/perl
# LoxBerry CSS Studio - Version: 4.0.1.1
use strict;
use warnings;
use FindBin qw($Bin);
use lib "$Bin/lib";
use JSON::PP ();
use ThemeStudio ();
my $data = ThemeStudio::request();
eval {
    ThemeStudio::lock();
    my $theme = ThemeStudio::writable_theme($data->{id}, 1);
    if (!defined($data->{revision}) || $data->{revision} ne ThemeStudio::revision($theme)) {
        ThemeStudio::error('409 Conflict', 'themeChanged', 'Theme changed; reload the Studio');
    }
    ThemeStudio::delete_theme($theme);
    1;
} or ThemeStudio::error('500 Internal Server Error', 'deleteFailed', 'Theme deletion failed');
ThemeStudio::response('200 OK', { ok => JSON::PP::true, id => $data->{id}, deleted_json => JSON::PP::true, deleted_css => JSON::PP::true });
