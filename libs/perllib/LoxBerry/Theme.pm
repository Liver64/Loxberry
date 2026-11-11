# LoxBerry core theme registry

use strict;
use warnings;

package LoxBerry::Theme;
our $VERSION = "4.0.1.21";

use base 'Exporter';
our @EXPORT_OK = qw(
	list_themes
	get_theme
	theme_exists
	normalize_theme
	current_theme
	theme_css_path
	theme_css_url
);

use JSON ();
use LoxBerry::System ();
use Digest::SHA ();


# Built-in core metadata is independent of writable theme configuration.
my %CORE_THEMES = (
	'classic-lb' => { id => 'classic-lb', name => 'Classic LoxBerry', type => 'core', version => '1.0.0', selectable => 1, studio => { editable => 0, deletable => 0 } },
	'clean-admin' => { id => 'clean-admin', name => 'Clean Admin (Alpha)', type => 'core', version => '1.0.0', selectable => 1, studio => { editable => 0, deletable => 0 } },
	'glass' => { id => 'glass', name => 'Glassmorphism (Alpha)', type => 'core', version => '1.0.0', selectable => 1, studio => { editable => 0, deletable => 0 } },
	'soft-rounded' => { id => 'soft-rounded', name => 'Soft & Rounded (Alpha)', type => 'core', version => '1.0.0', selectable => 1, studio => { editable => 0, deletable => 0 } },
);

sub is_core_theme { return defined($_[0]) && exists $CORE_THEMES{$_[0]} ? 1 : 0; }

sub _file_version
{
	my ($filepath) = @_;
	return undef if !defined $filepath || !-f $filepath;
	open(my $fh, '<', $filepath) or return undef;
	binmode($fh);
	my $sha = Digest::SHA->new(256);
	$sha->addfile($fh);
	close($fh);
	return substr($sha->hexdigest, 0, 12);
}

sub _versioned_url
{
	my ($url, $filepath) = @_;
	my $version = _file_version($filepath);
	return $url if !defined $version || $version eq '';
	return $url . ($url =~ /\?/ ? '&' : '?') . "v=$version";
}

sub _valid_theme_id
{
	my ($id) = @_;
	return 0 if !defined $id;
	return $id =~ /\A[a-z0-9][a-z0-9-]{0,63}\z/ ? 1 : 0;
}

sub _config_root
{
	return "$LoxBerry::System::lbsconfigdir/themes";
}

sub _data_root
{
	return "$LoxBerry::System::lbsdatadir/themes";
}

sub _paths_for
{
	my ($id, $scope) = @_;
	return if !_valid_theme_id($id);
	return if !defined $scope || ($scope ne 'core' && $scope ne 'user');

	return (
		($scope eq 'core' ? undef : _config_root() . "/$id.json"),
		($scope eq 'core' ? "$LoxBerry::System::lbshtmldir/css/themes/theme-$id.css" : _data_root() . "/theme-$id.css"),
	);
}

sub _scope_for_theme
{
	my ($id) = @_;
	return undef if !_valid_theme_id($id);

	# Reserved IDs never resolve to user-supplied files, even when core CSS is missing.
	if (is_core_theme($id)) {
		my (undef, $css) = _paths_for($id, 'core');
		return -f $css ? 'core' : undef;
	}
	my ($config, $css) = _paths_for($id, 'user');
	return 'user' if -f $config && -f $css;
	return undef;
}

sub _read_config
{
	my ($path) = @_;
	return undef if !defined $path || !-f $path;

	open(my $fh, '<', $path) or return undef;
	local $/;
	my $json = <$fh>;
	close($fh);

	my $cfg;
	eval { $cfg = JSON::from_json($json); };
	return undef if $@ || ref($cfg) ne 'HASH';
	return $cfg;
}

sub get_theme
{
	my ($id) = @_;
	return undef if !_valid_theme_id($id);

	my $scope = _scope_for_theme($id);
	return undef if !defined $scope;

	my ($config_path, $css_path) = _paths_for($id, $scope);
	my $cfg = $scope eq 'core' ? { %{$CORE_THEMES{$id}}, studio => { editable => 0, deletable => 0 } } : _read_config($config_path);
	return undef if !$cfg;
	return undef if !defined $cfg->{id} || $cfg->{id} ne $id;

	my $type = $scope eq 'core' ? 'core' : 'user';
	return undef if defined $cfg->{type} && $cfg->{type} ne $type;

	my $selectable = exists $cfg->{selectable} ? ($cfg->{selectable} ? 1 : 0) : 1;
	my $name = defined $cfg->{name} && $cfg->{name} ne '' ? $cfg->{name} : $id;

	return {
		%{$cfg},
		id          => $id,
		name        => $name,
		type        => $type,
		scope       => $scope,
		selectable  => $selectable,
		config_path => $config_path,
		css_path    => $css_path,
		css_url     => theme_css_url($id),
	};
}

sub theme_exists
{
	my ($id) = @_;
	return get_theme($id) ? 1 : 0;
}

sub list_themes
{
	my @themes;
	my %seen;

	for my $id (sort keys %CORE_THEMES) {
		my $theme = get_theme($id);
		push @themes, $theme if $theme;
		$seen{$id} = 1;
	}
	my $dir = _config_root();
	if (opendir(my $dh, $dir)) {
		my @files = sort grep { /\.json\z/ && -f "$dir/$_" } readdir($dh);
		closedir($dh);
		for my $file (@files) {
			(my $id = $file) =~ s/\.json\z//;
			next if $seen{$id}++;
			my $theme = get_theme($id);
			push @themes, $theme if $theme;
		}
	}

	return sort {
		($a->{type} cmp $b->{type}) ||
		(lc($a->{name}) cmp lc($b->{name})) ||
		($a->{id} cmp $b->{id})
	} @themes;
}

sub normalize_theme
{
	my ($id) = @_;
	my $theme = get_theme($id);
	return $theme->{id} if $theme && $theme->{selectable};

	my $fallback = get_theme('classic-lb');
	return 'classic-lb' if $fallback && $fallback->{selectable};

	for my $candidate (list_themes()) {
		return $candidate->{id} if $candidate->{selectable};
	}

	# The shipped core always contains classic-lb. Keep a deterministic final
	# fallback for damaged/incomplete installations.
	return 'classic-lb';
}

sub current_theme
{
	LoxBerry::System::read_generaljson() if !defined $LoxBerry::System::lbtheme;
	my $id = normalize_theme($LoxBerry::System::lbtheme);
	return get_theme($id);
}

sub theme_css_path
{
	my ($id) = @_;
	my $scope = _scope_for_theme($id);
	return undef if !defined $scope;
	my (undef, $css_path) = _paths_for($id, $scope);
	return $css_path;
}

sub theme_css_url
{
	my ($id) = @_;
	my $scope = _scope_for_theme($id);
	return undef if !defined $scope;
	my (undef, $css_path) = _paths_for($id, $scope);
	my $url = $scope eq 'core' ? "/system/css/themes/theme-$id.css" : "/admin/system/themes/theme-file.cgi/theme-$id.css";
	return _versioned_url($url, $css_path);
}

1;
