#include "stdafx.h"
#include "mullvadobjects.h"
#include "mullvadguids.h"

//static
std::unique_ptr<wfp::ProviderBuilder> MullvadObjects::Provider()
{
	auto builder = std::make_unique<wfp::ProviderBuilder>();

	(*builder)
		.name(L"VPN.vu")
		.description(L"VPN.vu firewall integration")
		.key(MullvadGuids::Provider());

	return builder;
}

//static
std::unique_ptr<wfp::SublayerBuilder> MullvadObjects::SublayerBaseline()
{
	auto builder = std::make_unique<wfp::SublayerBuilder>();

	(*builder)
		.name(L"VPN.vu baseline")
		.description(L"Filters that enforce a good baseline")
		.key(MullvadGuids::SublayerBaseline())
		.provider(MullvadGuids::Provider())
		.weight(MAXUINT16);

	return builder;
}

//static
std::unique_ptr<wfp::SublayerBuilder> MullvadObjects::SublayerDns()
{
	auto builder = std::make_unique<wfp::SublayerBuilder>();

	(*builder)
		.name(L"VPN.vu DNS")
		.description(L"Filters that restrict DNS traffic")
		.key(MullvadGuids::SublayerDns())
		.provider(MullvadGuids::Provider())
		.weight(MAXUINT16 - 1);

	return builder;
}

//static
std::unique_ptr<wfp::ProviderBuilder> MullvadObjects::ProviderPersistent()
{
	auto builder = std::make_unique<wfp::ProviderBuilder>();

	(*builder)
		.name(L"VPN.vu persistent")
		.description(L"VPN.vu firewall integration")
		.persistent()
		.key(MullvadGuids::ProviderPersistent());

	return builder;
}

//static
std::unique_ptr<wfp::SublayerBuilder> MullvadObjects::SublayerPersistent()
{
	auto builder = std::make_unique<wfp::SublayerBuilder>();

	(*builder)
		.name(L"VPN.vu persistent")
		.description(L"Filters that restrict traffic before WinFw is initialized")
		.key(MullvadGuids::SublayerPersistent())
		.provider(MullvadGuids::ProviderPersistent())
		.persistent()
		.weight(MAXUINT16);

	return builder;
}
