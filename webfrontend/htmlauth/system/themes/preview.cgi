#!/usr/bin/perl
# LoxBerry CSS Studio - Version: 4.0.1.20
use strict;
use warnings;
use utf8;
use FindBin qw($Bin);
use lib "$Bin/lib";
use CGI ();
use HTML::Template;
use ThemeStudio ();
use LoxBerry::Theme ();
use LoxBerry::System ();
my $cgi = CGI->new;
my $method = $ENV{REQUEST_METHOD} // 'GET';
if ($method ne 'GET' && $method ne 'HEAD') { ThemeStudio::error('405 Method Not Allowed', 'methodNotAllowed', 'GET or HEAD required'); }
my $id = scalar $cgi->param('theme');
my $theme;
if (defined($id) && $id ne '') {
    $theme = LoxBerry::Theme::get_theme($id);
    ThemeStudio::error('404 Not Found', 'themeNotFound', 'Theme is not registered') if !$theme;
} else { $theme = LoxBerry::Theme::current_theme(); }
ThemeStudio::error('404 Not Found', 'themeNotFound', 'No registered theme') if !$theme;
my ($lang, $dictionary) = ThemeStudio::language();
my $page = scalar($cgi->param('page')) // 'preview';
ThemeStudio::error('400 Bad Request', 'invalidPage', 'Invalid preview page') if $page ne 'preview' && $page ne 'help';
my $template = HTML::Template->new(filename => "$LoxBerry::System::lbstemplatedir/themes-preview.html", die_on_bad_params => 0, utf8 => 1);
$template->param(
    VERSION => '4.0.1.20', LANGUAGE => $lang, THEME_CLASS => 'theme-' . $theme->{id}, THEME_URL => $theme->{css_url},
    LANGUAGE_JSON => ThemeStudio::json_script($dictionary), HELP_PAGE => $page eq 'help' ? 1 : 0,
    HELP_TEXT => $dictionary->{REGISTRY_HELP_TEXT},
);
my %preview_parts;
for my $key (keys %{$dictionary}) {
    my ($number) = $key =~ /^PREVIEW_DOCUMENT_PART([0-9]+)$/;
    next if !defined $number;
    my $part = $dictionary->{$key};
    # Localized fragments may include shared runtime placeholders.
    $part =~ s/<TMPL_VAR LANGUAGE ESCAPE=HTML>/$lang/g;
    $part =~ s/<TMPL_VAR VERSION>/'4.0.1.20'/ge;
    $part =~ s/<TMPL_VAR THEME_CLASS ESCAPE=HTML>/'theme-' . $theme->{id}/ge;
    $part =~ s/<TMPL_VAR THEME_URL ESCAPE=HTML>/CGI::escapeHTML($theme->{css_url})/ge;
    $part =~ s/<TMPL_VAR THEME_CLASSES_JSON>/ThemeStudio::json_script('theme-' . $theme->{id})/ge;
    $preview_parts{"PREVIEW_$number"} = $part;
}
$template->param(%preview_parts, THEME_CLASSES_JSON => ThemeStudio::json_script('theme-' . $theme->{id}));
print "Content-Type: text/html; charset=utf-8\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\n\r\n";
exit if $method eq 'HEAD';
binmode(STDOUT, ':encoding(UTF-8)');
print $template->output;
