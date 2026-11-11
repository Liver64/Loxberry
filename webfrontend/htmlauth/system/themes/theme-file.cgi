#!/usr/bin/perl
# LoxBerry CSS Studio - Version: 4.0.1.20

use strict;
use warnings;

use Cwd qw(realpath);
use LoxBerry::System;
use Digest::SHA ();

my $method = $ENV{REQUEST_METHOD} // 'GET';
if ($method ne 'GET' && $method ne 'HEAD') {
	_print_error(405, 'Method Not Allowed', 'GET, HEAD');
}

my $path_info = $ENV{PATH_INFO} // '';
$path_info =~ s{^/+}{};
_print_error(404, 'Not Found') if $path_info eq '';

# Serve only user theme files and assets from the flat Studio data directory.
my @parts = split m{/+}, $path_info;
_print_error(404, 'Not Found') if !@parts;

for my $part (@parts) {
	_print_error(400, 'Bad Request') if $part eq '' || $part eq '.' || $part eq '..';
	_print_error(400, 'Bad Request') if $part !~ /\A[A-Za-z0-9._-]+\z/;
}

my $relative = join('/', @parts);
my ($extension) = $relative =~ /\.([A-Za-z0-9]+)\z/;
$extension = lc($extension // '');

my %mime = (
	css   => 'text/css; charset=utf-8',
	png   => 'image/png',
	jpg   => 'image/jpeg',
	jpeg  => 'image/jpeg',
	webp  => 'image/webp',
	gif   => 'image/gif',
	svg   => 'image/svg+xml',
	woff  => 'font/woff',
	woff2 => 'font/woff2',
);
_print_error(403, 'Forbidden') if !exists $mime{$extension};

my $root = "$LoxBerry::System::lbsdatadir/themes";
my $root_real = realpath($root);
_print_error(404, 'Not Found') if !defined $root_real;

my $requested = "$root/$relative";
my $file_real = realpath($requested);
_print_error(404, 'Not Found') if !defined $file_real || !-f $file_real;

# realpath() resolves symlinks. The prefix check therefore also prevents a
# symlink inside the theme tree from escaping data/system/themes.
my $prefix = $root_real . '/';
_print_error(403, 'Forbidden') if index($file_real, $prefix) != 0;

my @st = stat($file_real);
my $size = $st[7] // 0;
my $mtime = $st[9] // 0;
my $version = '';
if (open(my $hashfh, '<', $file_real)) {
	binmode($hashfh);
	my $sha = Digest::SHA->new(256);
	$sha->addfile($hashfh);
	close($hashfh);
	$version = substr($sha->hexdigest, 0, 12);
}
my $etag = $version ne '' ? '"' . $version . '"' : undef;
my $query = $ENV{QUERY_STRING} // '';
my $is_versioned = $version ne '' && $query =~ /(?:^|&)v=\Q$version\E(?:&|$)/;
my $cache_control = $is_versioned
	? 'public, max-age=31536000, immutable'
	: 'no-cache';

if (defined $etag && defined $ENV{HTTP_IF_NONE_MATCH} && $ENV{HTTP_IF_NONE_MATCH} eq $etag) {
	print "Status: 304 Not Modified\r\n";
	print "ETag: $etag\r\n";
	print "Cache-Control: $cache_control\r\n";
	print "X-Content-Type-Options: nosniff\r\n\r\n";
	exit 0;
}

my @weekday = qw(Sun Mon Tue Wed Thu Fri Sat);
my @month = qw(Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec);
my @gmt = gmtime($mtime);
my $last_modified = sprintf(
	'%s, %02d %s %04d %02d:%02d:%02d GMT',
	$weekday[$gmt[6]], $gmt[3], $month[$gmt[4]], $gmt[5] + 1900,
	$gmt[2], $gmt[1], $gmt[0]
);

print "Content-Type: $mime{$extension}\r\n";
print "Content-Length: $size\r\n";
print "Last-Modified: $last_modified\r\n";
print "ETag: $etag\r\n" if defined $etag;
print "X-Content-Type-Options: nosniff\r\n";
print "Cache-Control: $cache_control\r\n";
print "\r\n";

exit 0 if $method eq 'HEAD';

open(my $fh, '<', $file_real) or _print_error(500, 'Internal Server Error');
binmode($fh);
binmode(STDOUT);
my $buffer;
while (read($fh, $buffer, 65536)) {
	print $buffer;
}
close($fh);
exit 0;

sub _print_error
{
	my ($status, $message, $allow) = @_;
	print "Status: $status $message\r\n";
	print "Content-Type: text/plain; charset=utf-8\r\n";
	print "Allow: $allow\r\n" if defined $allow;
	print "X-Content-Type-Options: nosniff\r\n";
	print "Cache-Control: no-store\r\n\r\n";
	print "$message\n" if ($ENV{REQUEST_METHOD} // 'GET') ne 'HEAD';
	exit 0;
}
