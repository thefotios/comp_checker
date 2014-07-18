#!/usr/bin/perl
#
use strict;
use warnings;
use Getopt::Long;
use File::Basename;
use Data::Dumper;
use Digest::MD5 qw(md5_hex);
use JSON::XS;

my @data;
while (<>) {
	chomp($_);
	push @data, $_;
}
my $json_str = join("\n", @data);
my $data = JSON::XS::decode_json($json_str);
my $filelist_with_sums = $data->{nodes};
my %file_tree;
foreach my $pathname (keys %{$filelist_with_sums}) {
	my @path_parts  = split(/\//, $pathname);
	recurse_build_tree(\%file_tree, \@path_parts, $filelist_with_sums->{$pathname});
}

$data->{tree} = \%file_tree;

print JSON::XS::encode_json($data);


###########################################################################
sub recurse_build_tree {
	my ($hashref, $path, $id) = @_;

	my $node;
	return if(@$path == 0); # done recursing
	if(!exists $hashref->{$path->[0]}) {
		if(@$path == 1) {
			if(!exists $hashref->{'.'}) {
				$hashref->{'.'} = [];
			}
			#push @{$hashref->{'.'}}, $path->[0];
			push @{$hashref->{'.'}}, $id;
			shift @$path;
			return recurse_build_tree($hashref->{'.'}, $path, $id);
		} else {
			$hashref->{$path->[0]} = {};
			$node = shift @$path;
			return recurse_build_tree($hashref->{$node}, $path, $id);
		}
	} else {
		$node = shift @$path;
		return recurse_build_tree($hashref->{$node}, $path, $id);
	}
}

sub list_files {
	my @file_list = @_;

	foreach my $file (sort @file_list) {
		print "$file\n";
	}
}


