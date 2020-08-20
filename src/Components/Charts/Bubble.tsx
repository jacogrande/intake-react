import React from "react";
import { ResponsiveBubble } from "@nivo/circle-packing";
import { bubbleColors, IEntity } from "../StatProperty";
import { setSearch } from "../../redux/modules/explore";
import { NavLink } from "react-router-dom";
import { Tooltip } from "@material-ui/core";
import { BrowserView, MobileView } from "react-device-detect";

interface IBubble {
  values: IEntity;
  filter: string;
  link: string;
}

interface IRoot {
  name: string;
  loc: number;
  value: number;
  movies: number;
}

/**
 * A function that formats bubble data.
 * @param {IEntity} values The property values that statistics are gathered from
 * @param {string} filter The property to gather values from
 */
const formatData = (values: IEntity, filter: string): IRoot[] => {
  const allKeys = Object.keys(values);
  const lowestValue =
    allKeys.length > 0 &&
    values[
      allKeys.reduce((acc, key) =>
        values[key][filter] < values[acc][filter] ? key : acc
      )
    ][filter];
  const formatted = allKeys.map((key) => ({
    name: key,
    loc: values[key][filter] - (lowestValue - 1),
    value: values[key][filter],
    movies: values[key].movies,
  }));
  return formatted;
};

/**
 * Bubble chart component
 * @param {IBubble} props component props
 * @param {IEntity} props.values The property values that statistics are gathered from.
 * @param {string} props.filter The property to gather values from
 * @param {string} props.link The base pathname for all links in legend
 */
const Bubble = React.memo((props: IBubble) => {
  const [color] = React.useState<string[]>(
    bubbleColors[Math.floor(Math.random() * bubbleColors.length)]
  );
  const [data, setData] = React.useState<IRoot[]>([]);
  const [sortedData, setSortedData] = React.useState<IRoot[]>([]);
  const root = {
    name: "root",
    color: "hsl(1, 70%, 50%)",
    children: data,
  };

    // Format data whenever new props are passed down to Bubble component
  React.useEffect(() => {
    const formatted = formatData(props.values, props.filter);
    setData([...formatted]);
    formatted.sort((a, b) => b.value - a.value);
    setSortedData(formatted);
  }, [props]);

  if (data.length === 0) {
    return <p>no data has been collected yet</p>;
  }

  // Map values to colors
  const highestValue = root.children.reduce((acc, e) =>
    e.loc > acc.loc ? e : acc
  ).loc;
  const reducer =
    highestValue < color.length ? 1 : Math.ceil(highestValue / color.length);
  const colorFunc = (data: any) => {
    if (data.name === "root") {
      return "#1E262A";
    } else {
      return color[Math.ceil(data.loc / reducer) - 1];
    }
  };

  const createLabel = (e: any) => {
    return `${e.id}`;
  };

  const createTooltip = (data: any) => {
    if (data.data.name !== "root") {
      return (
        <p className="tooltip inline-flex bubble-tooltip">
          <span
            className="color-indicator"
            style={{ backgroundColor: data.color }}
          ></span>
          {data.data.name}: {data.data.value}
        </p>
      );
    }
  };

  const theme = {
    tooltip: {
      container: {
        padding: 0,
      },
    },
  };

  // Return Bubble JSX (using Nivo Responsive Bubble)
  return (
    <div className="bubble-container">
      <div className="bubble">
        <ResponsiveBubble
          root={root}
          theme={theme}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          identity="name"
          value="loc"
          colors={colorFunc}
          padding={6}
          labelSkipRadius={50}
          label={createLabel}
          labelTextColor={"black"}
          borderWidth={2}
          borderColor={{ from: "color" }}
          animate={true}
          tooltip={createTooltip}
          motionStiffness={90}
          motionDamping={12}
          isZoomable={false}
          onMouseEnter={(e: any) => console.log(e)}
        />
      </div>
      <div className="legend">
        <h3>Legend</h3>
        {sortedData.map((entity, i) => (
          <div className="legend-entry" key={entity.name}>
            <div className="row">
              <div
                className="legend-indicator"
                style={{ backgroundColor: colorFunc(entity) }}
              ></div>
              <BrowserView>
                <Tooltip title={`See stats for ${entity.name} movies`}>
                  <NavLink
                    to={`${props.link}/${entity.name}`}
                    className="green link"
                  >
                    {entity.name}
                  </NavLink>
                </Tooltip>{" "}
                :{" "}
                {entity.value.toLocaleString("fullwide", {
                  maximumFractionDigits: 2,
                })}
              </BrowserView>
              <MobileView>
                <Tooltip title={`See stats for ${entity.name} movies`}>
                  <p>
                    <NavLink
                      to={`${props.link}/${entity.name}`}
                      className="green link"
                    >
                      {entity.name}
                    </NavLink>
                    :{" "}
                    {entity.value.toLocaleString("fullwide", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </Tooltip>
              </MobileView>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default Bubble;
