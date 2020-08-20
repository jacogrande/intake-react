import React from "react";
import { ResponsiveLine, Serie } from "@nivo/line";
import { ResponsiveCalendar } from "@nivo/calendar";
import moment from "moment";

interface IViewingTimeline {
  dates: string[];
}

interface IGroup {
  [key: string]: { [key: string]: string[] };
}

/**
 * A function that organizes dates by month
 * @param {string[]} arr An array of date strings
 */
const organizeDates = (arr: string[]): IGroup => {
  /* 
    {
      year:
        month: 
          [
            dates
          ]  
    }
    */
  const group: IGroup = {};
  arr.forEach((date) => {
    const realDate = moment(date);
    const year = realDate.year();
    const month = realDate.format("MMM");
    if (!group[year]) group[year] = {};

    group[year][month]
      ? group[year][month].push(date)
      : (group[year][month] = [date]);
  });
  return group;
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface ICalendar {
  day: string;
  value: number;
}

/**
 * Viewing timeline component for statistics page
 * @param {IViewingTimeline} props Component properties
 * @param {string[]} props.dates An array of the dates the user viewed the specified movies.
 * @returns JSX component containing Nivo Line Chart and Nivo Calendar
 */
const ViewingTimeline = (props: IViewingTimeline) => {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<string>(
    moment(Date.now()).format("YYYY MMM")
  );
  const [lineData, setLineData] = React.useState<Serie[]>([]);
  const [calendarData, setCalendarData] = React.useState<ICalendar[]>([]);

  React.useEffect(() => {
    const organizedDates: IGroup = organizeDates(props.dates);
    // loop through months in the given year
    // if the current month is not found on the object, set it to 0
    const data: Serie = {
      id: "test",
      color: "#fff",
      data: [],
    };
    for (let m of months) {
      organizedDates["2020"] && organizedDates["2020"][m]
        ? data.data.push({ x: m, y: organizedDates["2020"][m].length })
        : data.data.push({ x: m, y: 0 });
    }
    setLineData([data]);

    const dayDict: { [key: string]: ICalendar } = {};
    props.dates.forEach((date) => {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      dayDict[formattedDate]
        ? dayDict[formattedDate].value++
        : (dayDict[formattedDate] = { day: formattedDate, value: 1 });
    });
    const calendarDates: ICalendar[] = [];
    for (let date in dayDict) {
      calendarDates.push(dayDict[date]);
    }
    setCalendarData(calendarDates);
  }, [props.dates, startDate, endDate]);

  const theme = {
    grid: {
      line: {
        stroke: "#000",
      },
    },
    axis: {
      legend: {
        text: {
          fill: "#EF4AB5",
          fontSize: 16,
        },
        color: "#eee",
        itemTextColor: "#eee",
        fill: "#eee",
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
        textColor: "#eee",
        itemTextColor: "#eee",
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

  const handleCalendarTooltip = (data: any) => (
    <p className="tooltip inline-flex">
      <span
        className="color-indicator"
        style={{ backgroundColor: data.color }}
      ></span>
      {moment(data.data.day).format("MMM DD, YYYY")}: {data.value} movie{data.value !== 1 && "s"} seen
    </p>
  );

  const handleTimelineTooltip = (data: any) => (
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
    <div className="viewing-container">
      <div className="graph-container-large margin-top">
        <h2>Viewing Timeline</h2>
        <ResponsiveLine
          data={lineData}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          tooltip={handleTimelineTooltip}
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
            legend: "Month",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            tickValues: 5,
            legend: "Movies",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          colors={() => "#EF4AB5"}
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
        />
      </div>
      <div
        className="graph-container-large margin-top-xx"
        id="calendar-container"
      >
        <ResponsiveCalendar
          data={calendarData}
          from="2020-02-01"
          to="2020-08-01"
          emptyColor="#171e22"
          colors={["#F2BF6C", "#F69A97", "#FB76C1", "#EF4AB5"]}
          margin={{ top: 50, right: 40, bottom: 40, left: 40 }}
          yearSpacing={40}
          monthBorderColor="#1E262A"
          dayBorderWidth={2}
          dayBorderColor="#1E262A"
          minValue={1}
          maxValue={4}
          legends={[
            {
              anchor: "bottom-right",
              direction: "row",
              translateY: 36,
              itemCount: 4,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: "right-to-left",
              textColor: "#eee",
              itemTextColor: "#eee",
              symbolBorderColor: "#eee",
            },
          ]}
          tooltip={handleCalendarTooltip}
        />
      </div>
    </div>
  );
};

export default ViewingTimeline;
