import React from "react";
import { ResponsivePie, PieDatum } from "@nivo/pie";
import "../../Styles/Stats.css";
import { formatPieData, colors} from "../Stats";
import Slider from "@material-ui/core/Slider";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import { ISortedStat } from "../../redux/modules/stats";

interface IPie {
  data: ISortedStat[];
  title: string;
  titleExtension?: string
}

/**
 * Pie chart component (using Nivo ResponsivePie)
 * @param props {IPie} component props:
 * @param {ISortedStat[]} props.data sorted property data
 * @param {string} props.title page title
 * @param {string} [props.titleExtension] page title extension for displaying average rating
 */
const Pie = (props: IPie) => {
  const [stats, setStats] = React.useState<PieDatum[]>([]);
  const [count, setCount] = React.useState<number>(5);
  const [color] = React.useState<string[]>(
    colors[Math.floor(Math.random() * colors.length)]
  );

  const muiTheme = createMuiTheme({
    overrides: {
      MuiSlider: {
        thumb: {
          color: "white",
        },
        track: {
          color: "#EF4AB5",
        },
        rail: {
          color: "#000",
          opacity: 1
        },
        valueLabel: {
          color: '#171e22'
        },
        mark: {
          opacity: 0,
        },
        markActive: {
          opacity: 0
        }
      },
    },
  });

  // get the top x values whenever new data is passed or x (count) is changed
  React.useEffect(() => {
    const topX = [...props.data].splice(0, count);
    let topXTotal = topX.map((e) => e.count);
    let total = 0;
    if (topXTotal.length > 0) total = topXTotal.reduce((sum, e) => sum + e);
    const others = [...props.data].splice(count, props.data.length);
    if(others.length > 0) {
      const othersCount = others.map((e) => e.count);
      const othersTotal = othersCount.reduce((sum, e) => sum + e);
      setStats(formatPieData(topX.concat([{key: "Others", count: othersTotal, color: "#79858b"}]), total+othersTotal, color));
    } else {
      setStats(formatPieData([...props.data].splice(0, count), total, color));
    }

  }, [props.data, count]);

  const handleTooltip = (data: any) => {
    return (
      <p className="tooltip inline-flex">
        <span
          className="color-indicator"
          style={{ backgroundColor: data.color }}
        ></span>
        {data.label}: {data.value} ({data.percentage}%)
      </p>
    );
  };

  const valueText = (value: number) => {
    return `${value} ${props.title.toLowerCase()}`;
  };

  let lastVal: number = 5;
  const handleSliderChange = (val: number) => {
    if(val != lastVal){
      setCount(val);
      lastVal = val;
    } 
  }

  const getColor = (e:any) => {
    return e.color;
  }

  return (
    <div className="graph-container margin-top">
      <h2>{props.titleExtension ? props.title+props.titleExtension : props.title}</h2>
      {props.title !== "Average Rating" && (
        <ThemeProvider theme={muiTheme}>
          <Slider
            defaultValue={5}
            getAriaValueText={valueText}
            aria-label="number of values to show"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={0}
            max={props.data.length}
            className="slider"
            style={{width: '150px'}}
            value={count}
            onChange={(e, val) => handleSliderChange(val as number)}
          />
        </ThemeProvider>
      )}
      <ResponsivePie
        data={stats}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.25}
        padAngle={4}
        cornerRadius={2}
        colors={getColor}
        radialLabelsSkipAngle={0}
        radialLabelsTextXOffset={6}
        radialLabelsTextColor="#eee"
        radialLabelsLinkOffset={0}
        radialLabelsLinkDiagonalLength={14}
        radialLabelsLinkHorizontalLength={18}
        radialLabelsLinkStrokeWidth={1}
        radialLabelsLinkColor={{ from: "color" }}
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor="#000"
        tooltip={handleTooltip}
      />
    </div>
  );
};

export default Pie;
