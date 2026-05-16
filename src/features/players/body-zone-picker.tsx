"use client";

import {
  bodyRegions,
  bodyZoneDetail,
  getBodyZoneDefinitions,
  hasBodyZoneFlag,
  type BodyRegion,
} from "@/domain/health/body-zone";

const figureRegions: Record<
  "front" | "back",
  readonly { region: BodyRegion; x: number; y: number; w: number; h: number }[]
> = {
  front: [
    { region: "head", x: 66, y: 8, w: 28, h: 18 },
    { region: "torso", x: 60, y: 30, w: 40, h: 34 },
    { region: "leftArm", x: 24, y: 30, w: 30, h: 12 },
    { region: "rightArm", x: 106, y: 30, w: 30, h: 12 },
    { region: "leftLeg", x: 64, y: 68, w: 14, h: 44 },
    { region: "rightLeg", x: 82, y: 68, w: 14, h: 44 },
  ],
  back: [
    { region: "upperBack", x: 60, y: 30, w: 40, h: 18 },
    { region: "lowerBack", x: 60, y: 50, w: 40, h: 14 },
  ],
};

/**
 * Selector visual de región y zonas anatómicas para lesiones.
 */
export function BodyZonePicker({
  selectedRegion,
  selectedZoneDetail,
  labels,
  onRegionChange,
  onToggleZone,
}: {
  selectedRegion: BodyRegion;
  selectedZoneDetail: number;
  labels: {
    title: string;
    front: string;
    back: string;
    regionPrefix: string;
    zonesTitle: string;
    region: Record<BodyRegion, string>;
    zone: Record<string, string>;
  };
  onRegionChange: (region: BodyRegion) => void;
  onToggleZone: (flag: number) => void;
}) {
  const regionZones = getBodyZoneDefinitions(selectedRegion);

  return (
    <div className="space-y-3">
      <p className="text-xs text-foreground/70">{labels.title}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <RegionFigure
          title={labels.front}
          side="front"
          selectedRegion={selectedRegion}
          labels={labels.region}
          onRegionChange={onRegionChange}
        />
        <RegionFigure
          title={labels.back}
          side="back"
          selectedRegion={selectedRegion}
          labels={labels.region}
          onRegionChange={onRegionChange}
        />
      </div>

      <p className="text-xs text-foreground/80">
        {labels.regionPrefix}: <strong>{labels.region[selectedRegion]}</strong>
      </p>

      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-2 text-xs text-foreground/70">{labels.zonesTitle}</legend>
        {regionZones.map((zone) => {
          const checked = hasBodyZoneFlag(selectedZoneDetail, zone.flag);
          return (
            <button
              key={`${selectedRegion}-${zone.flag}`}
              type="button"
              aria-pressed={checked}
              onClick={() => onToggleZone(zone.flag)}
              className={[
                "rounded-md border px-2 py-1 text-xs transition",
                checked
                  ? "border-primary bg-primary/20 text-foreground"
                  : "border-outline-variant bg-surface text-foreground/80 hover:bg-surface-container",
              ].join(" ")}
            >
              {labels.zone[zone.code]}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onToggleZone(bodyZoneDetail.none)}
          className="rounded-md border border-outline-variant px-2 py-1 text-xs text-foreground/80 hover:bg-surface-container"
        >
          Clear
        </button>
      </fieldset>
    </div>
  );
}

/**
 * Subcomponente SVG con hit-areas para elegir región corporal.
 */
function RegionFigure({
  title,
  side,
  selectedRegion,
  labels,
  onRegionChange,
}: {
  title: string;
  side: "front" | "back";
  selectedRegion: BodyRegion;
  labels: Record<BodyRegion, string>;
  onRegionChange: (region: BodyRegion) => void;
}) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container p-2">
      <p className="mb-2 text-center text-xs uppercase tracking-wide text-foreground/70">{title}</p>
      <svg viewBox="0 0 160 120" className="h-40 w-full">
        <rect x="72" y="8" width="16" height="18" rx="8" className="fill-surface" />
        <rect x="66" y="30" width="28" height="38" rx="8" className="fill-surface" />
        <rect x="34" y="30" width="30" height="10" rx="5" className="fill-surface" />
        <rect x="96" y="30" width="30" height="10" rx="5" className="fill-surface" />
        <rect x="66" y="68" width="12" height="44" rx="6" className="fill-surface" />
        <rect x="82" y="68" width="12" height="44" rx="6" className="fill-surface" />

        {figureRegions[side].map((reg) => {
          const selected = selectedRegion === reg.region;
          return (
            <g key={`${side}-${reg.region}`}>
              <rect
                x={reg.x}
                y={reg.y}
                width={reg.w}
                height={reg.h}
                rx="6"
                className={selected ? "fill-primary/50" : "fill-transparent"}
              />
              <foreignObject x={reg.x} y={reg.y} width={reg.w} height={reg.h}>
                <button
                  type="button"
                  aria-label={labels[reg.region]}
                  title={labels[reg.region]}
                  onClick={() => onRegionChange(reg.region)}
                  className="h-full w-full"
                />
              </foreignObject>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {bodyRegions.map((region) => (
          <button
            key={`${side}-chip-${region}`}
            type="button"
            onClick={() => onRegionChange(region)}
            className={[
              "rounded border px-1 py-0.5 text-[10px]",
              selectedRegion === region
                ? "border-primary bg-primary/20 text-foreground"
                : "border-outline-variant text-foreground/70",
            ].join(" ")}
          >
            {labels[region]}
          </button>
        ))}
      </div>
    </div>
  );
}
