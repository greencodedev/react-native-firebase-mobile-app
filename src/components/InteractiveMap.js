// import React, { Component } from "react";
// import { View } from "react-native";
// // import { Svg } from "expo";
// import Svg from 'react-native-svg';
// import { feature } from "topojson-client";
// import { geoMercator, geoAlbers, geoPath } from "d3-geo";
// import { filter, pathOr, isEmpty, keys, chain } from "ramda";
// const { G, Path, Circle, Defs, Use, Symbol } = Svg;

// import { world } from "@assets/data/map";
// import * as colors from "@constants/colors";

// const US_ID = 840;

// export default class InteractiveMap extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       data: [],
//       markers: props.markers
//     };
//   }
//   UNSAFE_componentWillReceiveProps({ markers }) {
//     console.log("new props", markers);
//     this.setState({
//       markers
//     });
//   }
//   componentDidMount() {
//     this.handleDataArrival(world);
//   }
//   albersProjection() {
//     const { width, height } = this.props;
//     return geoAlbers()
//       .scale(512)
//       .translate([width / 2, height / 2]);
//   }
//   getCountryPath(d) {
//     return geoPath(this.albersProjection())(d);
//   }
//   getMarkerPath(c) {
//     return this.albersProjection()(c);
//   }
//   render() {
//     const { data, markers } = this.state;
//     const { width, height } = this.props;
//     const viewBox = [0, 0, width, height].join(" ");
//     // console.log(keys(data[0]));
//     const countries = filter(
//       d => parseInt(pathOr(0, ["id"], d)) === US_ID,
//       data
//     );
//     return (
//       <View style={this.props.containerStyle}>
//         <Svg width={width} height={height} viewBox={viewBox}>
//           {countries.map((d, i) => {
//             const key = `path-${i}`;
//             const shouldRender = true;
//             const fill = shouldRender ? "#00649B" : "transparent";
//             const stroke = shouldRender ? "#DFDFDF" : "transparent";
//             const strokeWidth = 0.75;
//             return (
//               <Path
//                 key={key}
//                 d={this.getCountryPath(d)}
//                 fill={fill}
//                 stroke={stroke}
//                 strokeWidth={strokeWidth}
//                 onPress={() => this.handlePress(d, i)}
//               />
//             );
//           })}
//           <G>
//             {!isEmpty(countries) &&
//               markers.map((event, i) => {
//                 const coordinates = [
//                   [-74.0059, 40.7128],
//                   [-122.431297, 37.773972],
//                   [-118.2437, 34.0522]
//                 ][i];
//                 const key = `trophy-${i}`;
//                 const fill = colors[event.type]; // TODO: handle exceptions
//                 return (
//                   <Circle
//                     key={key}
//                     cx={this.getMarkerPath(coordinates)[0]}
//                     cy={this.getMarkerPath(coordinates)[1]}
//                     r={20630000 / 3000000}
//                     fill={fill}
//                     stroke="#FFFFFF"
//                     className="marker"
//                     onPress={() => this.handleMarkerPress(event)}
//                   />
//                 );
//               })}
//           </G>
//         </Svg>
//       </View>
//     );
//   }
//   handlePress(data, index) {
//     console.log("Press on", data.id);
//   }
//   handleDataArrival(data) {
//     console.log("data arrived");
//     const features = feature(data, data.objects.countries).features;
//     this.setState({ data: features });
//   }
//   handleMarkerPress(event) {
//     if (this.props.onMarkerPress) this.props.onMarkerPress(event);
//   }
// }
