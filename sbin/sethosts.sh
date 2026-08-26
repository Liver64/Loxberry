#!/bin/sh
# Keeps the current IPv4 address for our hostname in /etc/hosts.
# Symlinked into both /etc/network/if-up.d/ (executed, sets $IFACE) and
# /etc/dhcp/dhclient-exit-hooks.d/ (sourced by dhclient-script via its
# run_hook(), sets $interface) - no exit/return, since exiting a sourced
# script would abort the caller (dhclient-script) instead of just us.

PATH=/sbin:/bin:/usr/sbin:/usr/bin

HN=$(hostname)
IF="${IFACE:-${interface:-}}"

if [ -n "$IF" ] && [ "$IF" != "lo" ]; then
	IP=$(ip -4 -o addr show dev "$IF" 2>/dev/null | \
		awk '{split($4,a,"/"); print a[1]; exit}')

	if [ -n "$IP" ]; then
		sed -i "/$HN/d" /etc/hosts
		printf '%s\t%s\n' "$IP" "$HN" >> /etc/hosts

		if pgrep -x dnsmasq >/dev/null 2>&1; then
			systemctl restart dnsmasq >/dev/null 2>&1
		fi
	fi
fi
