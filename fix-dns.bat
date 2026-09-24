@echo off
:: Batch script to fix local IPv4 and IPv6 DNS on Windows
echo =========================================================
echo Setting Wi-Fi IPv4 and IPv6 DNS to Google Public DNS...
echo =========================================================

:: Set IPv4 DNS to Google & Cloudflare
netsh interface ip set dns name="WiFi" static 8.8.8.8 primary
netsh interface ip add dns name="WiFi" 1.1.1.1 index=2

:: Set IPv6 DNS to Google IPv6 DNS
netsh interface ipv6 set dnsservers name="WiFi" static 2001:4860:4860::8888 primary
netsh interface ipv6 add dnsservers name="WiFi" 2001:4860:4860::8844 index=2

echo.
echo Flushing Windows DNS Resolver Cache...
ipconfig /flushdns

echo.
echo =========================================================
echo SUCCESS! IPv4 and IPv6 are now both using Google DNS.
echo.
echo Please refresh your browser or open: https://numvax.com
echo =========================================================
pause
