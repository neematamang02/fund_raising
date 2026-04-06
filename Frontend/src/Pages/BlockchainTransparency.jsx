import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
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
    return <Badge className="bg-chart-2/15 text-chart-2 border-chart-2/25">DONATION</Badge>;
  }
  return <Badge className="bg-chart-4/15 text-chart-4 border-chart-4/25">PAYOUT</Badge>;
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

export default function BlockchainTransparency() {
  const [campaignId, setCampaignId] = useState("");
  const [chainState, setChainState] = useState(null);
  const [simulatedState, setSimulatedState] = useState(null);
  const [actionError, setActionError] = useState("");
  const [copiedHash, setCopiedHash] = useState("");
  const [expandedHashKey, setExpandedHashKey] = useState("");

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

  const isValid = simulatedState?.isValid ?? chainState?.isValid ?? data?.isValid ?? true;

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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Blockchain Transparency</h1>
            <p className="text-muted-foreground mt-1.5">
              Donation and payout records are stored as append-only blocks to keep the timeline auditable.
            </p>
          </div>
          <ChainStatus isValid={isValid} />
        </div>

        <Card className="border">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Filter by campaignId</label>
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

        {isLoading ? (
          <Card className="border">
            <CardContent className="p-6 text-muted-foreground">Loading blockchain...</CardContent>
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
            <CardContent className="p-6 text-muted-foreground">No blocks found for the selected filter.</CardContent>
          </Card>
        ) : null}

        {!isLoading && !error && blocks.length > 0 ? (
          <div className="space-y-3">
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
                      <p className="text-xs text-muted-foreground">Timestamp</p>
                      <p className="font-medium text-foreground">{formatDate(block.timestamp)}</p>
                    </div>
                    <div className="rounded-md border bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">campaignId</p>
                      <p className="font-medium text-foreground break-all">{block.data?.campaignId || "-"}</p>
                    </div>
                  </div>

                  <div className="rounded-md border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Data</p>
                    <pre className="text-xs whitespace-pre-wrap break-all text-foreground">
                      {JSON.stringify(block.data, null, 2)}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-md border bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Hash</p>
                      <div className="flex items-center gap-2">
                        <p title={block.hash} className="font-mono text-foreground break-all flex-1">
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
                              prev === `${block.index}-hash` ? "" : `${block.index}-hash`,
                            )
                          }
                        >
                          {expandedHashKey === `${block.index}-hash` ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-md border bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Previous Hash</p>
                      <div className="flex items-center gap-2">
                        <p title={block.previousHash} className="font-mono text-foreground break-all flex-1">
                          {expandedHashKey === `${block.index}-prev`
                            ? block.previousHash
                            : trimHash(block.previousHash)}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(block.previousHash)}
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
                              prev === `${block.index}-prev` ? "" : `${block.index}-prev`,
                            )
                          }
                        >
                          {expandedHashKey === `${block.index}-prev` ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        <Card className="border bg-primary/5 border-primary/15">
          <CardContent className="p-5 text-sm text-foreground flex items-start gap-2">
            {isValid ? <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" /> : <ShieldAlert className="h-4 w-4 text-destructive mt-0.5" />}
            <p>
              Current chain result: {isValid ? "Chain Valid" : "Tampered"}. This demo uses SHA-256 linked hashes for transparency only and does not use cryptocurrency or a distributed blockchain network.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
