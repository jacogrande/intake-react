import React from "react";
import { ResponsiveLine, Serie } from "@nivo/line";

interface IReleaseTimeline {
  dates: string[];
}

/**
 * Line chart for movie release dates
 * @param {IReleaseTimeline} props Component props
 * @param {string[]} props.dates List of dates movies were released.
 */
const ReleaseTimeline = (props: IReleaseTimeline) => {
  const [lineData, setLineData] = React.useState<Serie[]>([]);

  // Whenever new dates are passed down to this component, map them to decades.
  React.useEffect(() => {
    if (props.dates.length > 0) {
      const dateDict: { [key: string]: number } = {};
      const earliest = parseInt(
        props.dates.reduce((acc, e) => (e < acc ? e : acc))
      );
      const latest = new Date().getFullYear();
      for (
        let i = 0;
        i <= Math.ceil(latest / 10) - Math.floor(earliest / 10);
        i++
      ) {
        dateDict[(earliest + i * 10).toString().substring(0, 3)] = 0;
      }
      props.dates.forEach((date) => dateDict[date.substring(0, 3)]++);
      const data: { x: string; y: number }[] = [];
      for (let i in dateDict) {
        data.push({ x: `${i}0s`, y: dateDict[i] });
      }
      setLineData([
        {
          id: "releaseTimeline",
          color: "#fff",
          data: data,
        },
      ]);
    }
  }, [props.dates]);
  const theme = {
    grid: {
      line: {
        stroke: "#000",
      },
    },
    axis: {
      legend: {
        text: {
          fill: "#96ddc2",
          fontSize: 16,
        },
      },
      ticks: {
        text: {
          fill: "#eee",
          fontSize: 12,
        },
        line: {
          stroke: "#eee",
          strokeWidth: 1,
        },
      },
      domain: {
        line: {
          stroke: "#eee",
          strokeWidth: 1,
        },
      },
    },
    crosshair: {
      line: {
        stroke: "#eee",
        strokeWidth: 1,
        strokeOpacity: 0.33,
      },
    },
  };

  const handleTooltip = (data: any) => (
    <p className="tooltip-line inline-flex">
      <span
        className="color-indicator"
        style={{ backgroundColor: data.point.borderColor }}
      ></span>
      {data.point.data.x} : {data.point.data.y} movie
      {data.point.data.y !== 1 && "s"} seen
    </p>
  );

  return (
    <div className="graph-container-large margin-top">
      <h2>Release Timeline</h2>
      <ResponsiveLine
        data={lineData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: true,
          reverse: false,
        }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        theme={theme}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "decade",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          tickValues: 5,
          legend: "movies",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        colors={() => "#96ddc2"}
        lineWidth={3}
        pointSize={5}
        pointColor={{ theme: "background" }}
        pointBorderWidth={5}
        pointBorderColor={{ from: "serieColor" }}
        pointLabel="y"
        pointLabelYOffset={-15}
        areaOpacity={0}
        useMesh={true}
        enableGridX={false}
        enableGridY={false}
        tooltip={handleTooltip}
      />
    </div>
  );
};

export default ReleaseTimeline;
