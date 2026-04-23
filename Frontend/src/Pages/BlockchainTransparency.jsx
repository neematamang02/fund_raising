import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  HandCoins,
  Layers,
  Receipt,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getBlockchain,
  simulateBlockchainTampering,
  verifyBlockchain,
} from "@/services/blockchainApi";

function ChainStatus({ isValid }) {
  if (isValid) {
    return (
      <Badge className="bg-primary/15 text-primary border-primary/20">
        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
        Chain Valid
      </Badge>
    );
  }

  return (
    <Badge className="bg-destructive/15 text-destructive border-destructive/25">
      <ShieldAlert className="h-3.5 w-3.5 mr-1" />
      Tampered
    </Badge>
  );
}

function BlockTypeBadge({ type }) {
  if (type === "DONATION") {
    return (
      <Badge className="bg-chart-2/15 text-chart-2 border-chart-2/25">
        DONATION
      </Badge>
    );
  }
  return (
    <Badge className="bg-chart-4/15 text-chart-4 border-chart-4/25">
      PAYOUT
    </Badge>
  );
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function trimHash(value) {
  if (!value || value.length < 20) {
    return value || "-";
  }

  return `${value.slice(0, 10)}...${value.slice(-10)}`;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function MetricCard({ title, value, helper, icon: Icon }) {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{helper}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BlockchainTransparency() {
  const [campaignId, setCampaignId] = useState("");
  const [chainState, setChainState] = useState(null);
  const [simulatedState, setSimulatedState] = useState(null);
  const [actionError, setActionError] = useState("");
  const [copiedHash, setCopiedHash] = useState("");
  const [expandedHashKey, setExpandedHashKey] = useState("");
  const [showTechnical, setShowTechnical] = useState(false);

  const copyToClipboard = async (value) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedHash(value);
      window.setTimeout(() => setCopiedHash(""), 1200);
    } catch (_err) {
      // Ignore clipboard failures in unsupported environments.
    }
  };

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["blockchain", campaignId],
    queryFn: () => getBlockchain(campaignId || undefined),
  });

  const blocks = useMemo(() => {
    if (simulatedState?.blocks) {
      return simulatedState.blocks;
    }
    return data?.blocks || [];
  }, [data, simulatedState]);

  const isValid =
    simulatedState?.isValid ?? chainState?.isValid ?? data?.isValid ?? true;

  const overview = useMemo(() => {
    const donationBlocks = blocks.filter((block) => block.type === "DONATION");
    const payoutBlocks = blocks.filter((block) => block.type === "PAYOUT");

    const totalDonated = donationBlocks.reduce(
      (sum, block) => sum + asNumber(block.data?.amount),
      0,
    );
    const totalPaidOut = payoutBlocks.reduce(
      (sum, block) => sum + asNumber(block.data?.amount),
      0,
    );

    return {
      donationCount: donationBlocks.length,
      payoutCount: payoutBlocks.length,
      totalDonated,
      totalPaidOut,
      pendingAmount: Math.max(totalDonated - totalPaidOut, 0),
      latestActivity: blocks.length
        ? blocks[blocks.length - 1].timestamp
        : null,
    };
  }, [blocks]);

  const campaignFlows = useMemo(() => {
    const grouped = new Map();

    blocks.forEach((block) => {
      const id = block?.data?.campaignId || "Unknown Campaign";
      const amount = asNumber(block?.data?.amount);

      if (!grouped.has(id)) {
        grouped.set(id, {
          campaignId: id,
          campaignTitle: block?.data?.campaignTitle || null,
          donated: 0,
          paidOut: 0,
          donationCount: 0,
          payoutCount: 0,
          lastActivity: block.timestamp,
          lastDonationHash: null,
          lastPayoutHash: null,
          lastPayoutDate: null,
        });
      }

      const item = grouped.get(id);
      if (!item.campaignTitle && block?.data?.campaignTitle) {
        item.campaignTitle = block.data.campaignTitle;
      }
      item.lastActivity =
        block.timestamp > item.lastActivity
          ? block.timestamp
          : item.lastActivity;

      if (block.type === "DONATION") {
        item.donated += amount;
        item.donationCount += 1;
        item.lastDonationHash = block.hash;
      }

      if (block.type === "PAYOUT") {
        item.paidOut += amount;
        item.payoutCount += 1;
        item.lastPayoutHash = block.hash;
        item.lastPayoutDate = block.data?.paidDate || block.timestamp;
      }
    });

    return Array.from(grouped.values())
      .map((flow) => ({
        ...flow,
        pending: Math.max(flow.donated - flow.paidOut, 0),
      }))
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  }, [blocks]);

  const legendItems = [
    {
      key: "donation",
      color: "bg-chart-2/15 text-chart-2 border-chart-2/25",
      label: "Donation Recorded",
      detail: "A donor payment was captured successfully.",
    },
    {
      key: "processing",
      color: "bg-chart-4/15 text-chart-4 border-chart-4/25",
      label: "Pending Payout",
      detail: "Money is still held in campaign balance.",
    },
    {
      key: "paid",
      color: "bg-primary/15 text-primary border-primary/25",
      label: "Paid Out",
      detail: "Organizer payout was completed and traceable.",
    },
  ];

  const campaignOptions = useMemo(() => {
    const seen = new Set();
    const ids = [];

    (data?.blocks || []).forEach((block) => {
      const value = block?.data?.campaignId;
      if (value && !seen.has(value)) {
        seen.add(value);
        ids.push(value);
      }
    });

    return ids;
  }, [data]);

  const handleVerify = async () => {
    try {
      setActionError("");
      setSimulatedState(null);
      const result = await verifyBlockchain(campaignId || undefined);
      setChainState(result);
    } catch (err) {
      setActionError(err.message || "Failed to verify chain.");
    }
  };

  const handleTamper = async () => {
    try {
      setActionError("");
      const result = await simulateBlockchainTampering(campaignId || undefined);
      setSimulatedState(result);
    } catch (err) {
      setActionError(err.message || "Failed to simulate tampering.");
    }
  };

  return (
    <div className="min-h-screen surface-page py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Blockchain Transparency
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Clear donation to payout tracking with an append-only ledger.
              Technical block details are available below when needed.
            </p>
          </div>
          <ChainStatus isValid={isValid} />
        </div>

        <Card className="border">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Filter by campaignId
                </label>
                <Input
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value.trim())}
                  placeholder="Enter campaignId"
                  list="campaignId-options"
                />
                <datalist id="campaignId-options">
                  {campaignOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={() => refetch()} disabled={isFetching}>
                  Reload
                </Button>
                <Button variant="outline" onClick={handleVerify}>
                  Verify Chain
                </Button>
                <Button variant="destructive" onClick={handleTamper}>
                  Simulate Tampering
                </Button>
              </div>
            </div>

            {actionError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {actionError}
              </div>
            ) : null}

            {simulatedState?.message ? (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                {simulatedState.message}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {!isLoading && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              title="Total Donations"
              value={overview.donationCount}
              helper="Donation blocks"
              icon={Receipt}
            />
            <MetricCard
              title="Total Payouts"
              value={overview.payoutCount}
              helper="Payout blocks"
              icon={HandCoins}
            />
            <MetricCard
              title="Money Donated"
              value={formatMoney(overview.totalDonated)}
              helper="Sum of all donation blocks"
              icon={Layers}
            />
            <MetricCard
              title="Pending to Payout"
              value={formatMoney(overview.pendingAmount)}
              helper={
                overview.latestActivity
                  ? `Last activity ${formatDate(overview.latestActivity)}`
                  : "No block activity yet"
              }
              icon={ShieldCheck}
            />
          </div>
        ) : null}

        {!isLoading && !error ? (
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">How to Read This Page</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {legendItems.map((item) => (
                <div
                  key={item.key}
                  className="rounded-md border bg-muted/30 p-3"
                >
                  <Badge className={item.color}>{item.label}</Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <Card className="border">
            <CardContent className="p-6 text-muted-foreground">
              Loading blockchain...
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border border-destructive/30">
            <CardContent className="p-6 text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error.message}
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error && blocks.length === 0 ? (
          <Card className="border">
            <CardContent className="p-6 text-muted-foreground">
              No blocks found for the selected filter.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error && campaignFlows.length > 0 ? (
          <div className="space-y-3">
            {campaignFlows.map((flow) => {
              const paidRatio =
                flow.donated > 0
                  ? Math.min((flow.paidOut / flow.donated) * 100, 100)
                  : 0;

              return (
                <Card key={flow.campaignId} className="border">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Campaign
                        </p>
                        <p className="text-base font-semibold text-foreground break-all">
                          {flow.campaignTitle || flow.campaignId}
                        </p>
                        {flow.campaignTitle ? (
                          <p className="text-xs text-muted-foreground break-all">
                            {flow.campaignId}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-chart-2/15 text-chart-2 border-chart-2/25">
                          {flow.donationCount} donations
                        </Badge>
                        <Badge className="bg-chart-4/15 text-chart-4 border-chart-4/25">
                          {flow.payoutCount} payouts
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="rounded-md border bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Donated</p>
                        <p className="font-semibold text-foreground">
                          {formatMoney(flow.donated)}
                        </p>
                      </div>
                      <div className="rounded-md border bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">
                          Paid Out
                        </p>
                        <p className="font-semibold text-foreground">
                          {formatMoney(flow.paidOut)}
                        </p>
                      </div>
                      <div className="rounded-md border bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="font-semibold text-foreground">
                          {formatMoney(flow.pending)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Donation to payout progress</span>
                        <span>{paidRatio.toFixed(0)}% paid out</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${paidRatio}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-chart-2/15 text-chart-2 border-chart-2/25">
                        Donation Recorded
                      </Badge>
                      <Badge className="bg-chart-4/15 text-chart-4 border-chart-4/25">
                        {flow.pending > 0 ? "Pending Payout" : "No Pending"}
                      </Badge>
                      <Badge className="bg-primary/15 text-primary border-primary/25">
                        {flow.payoutCount > 0 ? "Paid Out" : "Awaiting Payout"}
                      </Badge>
                    </div>

                    <div className="rounded-md border bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Traceability
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
                        <span className="font-mono">
                          {trimHash(flow.lastDonationHash || "-")}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono">
                          {trimHash(flow.lastPayoutHash || "Pending")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {flow.lastPayoutDate
                          ? `Latest payout ${formatDate(flow.lastPayoutDate)}`
                          : "No payout recorded yet"}
                      </p>
                      {flow.lastPayoutHash ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 mt-2"
                          onClick={() => copyToClipboard(flow.lastPayoutHash)}
                        >
                          {copiedHash === flow.lastPayoutHash ? (
                            <Check className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 mr-1" />
                          )}
                          Copy latest payout hash
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}

        {!isLoading && !error && blocks.length > 0 ? (
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Technical Block Details</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTechnical((prev) => !prev)}
                >
                  {showTechnical ? "Hide" : "Show"}
                </Button>
              </CardTitle>
            </CardHeader>
            {showTechnical ? (
              <CardContent className="space-y-3">
                {blocks.map((block) => (
                  <Card key={`${block.index}-${block.hash}`} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between gap-2">
                        <span>Block #{block.index}</span>
                        <BlockTypeBadge type={block.type} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-md border bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">
                            Timestamp
                          </p>
                          <p className="font-medium text-foreground">
                            {formatDate(block.timestamp)}
                          </p>
                        </div>
                        <div className="rounded-md border bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">
                            campaignId
                          </p>
                          <p className="font-medium text-foreground break-all">
                            {block.data?.campaignId || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-md border bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          Data
                        </p>
                        <pre className="text-xs whitespace-pre-wrap break-all text-foreground">
                          {JSON.stringify(block.data, null, 2)}
                        </pre>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-md border bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Hash</p>
                          <div className="flex items-center gap-2">
                            <p
                              title={block.hash}
                              className="font-mono text-foreground break-all flex-1"
                            >
                              {expandedHashKey === `${block.index}-hash`
                                ? block.hash
                                : trimHash(block.hash)}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => copyToClipboard(block.hash)}
                            >
                              {copiedHash === block.hash ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7"
                              onClick={() =>
                                setExpandedHashKey((prev) =>
                                  prev === `${block.index}-hash`
                                    ? ""
                                    : `${block.index}-hash`,
                                )
                              }
                            >
                              {expandedHashKey === `${block.index}-hash`
                                ? "Hide"
                                : "Show"}
                            </Button>
                          </div>
                        </div>
                        <div className="rounded-md border bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">
                            Previous Hash
                          </p>
                          <div className="flex items-center gap-2">
                            <p
                              title={block.previousHash}
                              className="font-mono text-foreground break-all flex-1"
                            >
                              {expandedHashKey === `${block.index}-prev`
                                ? block.previousHash
                                : trimHash(block.previousHash)}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                copyToClipboard(block.previousHash)
                              }
                            >
                              {copiedHash === block.previousHash ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7"
                              onClick={() =>
                                setExpandedHashKey((prev) =>
                                  prev === `${block.index}-prev`
                                    ? ""
                                    : `${block.index}-prev`,
                                )
                              }
                            >
                              {expandedHashKey === `${block.index}-prev`
                                ? "Hide"
                                : "Show"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            ) : null}
          </Card>
        ) : null}

        <Card className="border bg-primary/5 border-primary/15">
          <CardContent className="p-5 text-sm text-foreground flex items-start gap-2">
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-destructive mt-0.5" />
            )}
            <p>
              Current chain result: {isValid ? "Chain Valid" : "Tampered"}. This
              is an internal SHA-256 hash-linked audit ledger for donation
              transparency. It is separate from payment gateways and does not
              require cryptocurrency or a distributed blockchain network.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
