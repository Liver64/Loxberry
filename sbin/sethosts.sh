#!/bin/sh
# Keeps the current IPv4 address for our hostname in /etc/hosts.
# Symlinked into both /etc/network/if-up.d/ (sets $IFACE) and
# /etc/dhcp/dhclient-exit-hooks.d/ (sets $interface) - the fallback
# below covers whichever hook invoked us.

PATH=/sbin:/bin:/usr/sbin:/usr/bin

HN=$(hostname)
IF="${IFACE:-${interface:-}}"

[ -n "$IF" ] || exit 0
[ "$IF" != "lo" ] || exit 0

IP=$(ip -4 -o addr show dev "$IF" 2>/dev/null | \
	awk '{split($4,a,"/"); print a[1]; exit}')

[ -n "$IP" ] || exit 0

sed -i "/$HN/d" /etc/hosts
printf '%s\t%s\n' "$IP" "$HN" >> /etc/hosts

if pgrep -x dnsmasq >/dev/null 2>&1; then
	systemctl restart dnsmasq >/dev/null 2>&1
fi

exit 0
