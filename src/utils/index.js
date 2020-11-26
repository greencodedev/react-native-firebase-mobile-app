import * as R from "ramda";
const km2mile = 0.621371

export const createCancelablePromise = promise => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => (hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)),
      error => (hasCanceled_ ? reject({ isCanceled: true }) : reject(error))
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    }
  };
};

export const hashOf = str => {
  /*jshint bitwise:false */
  let i;
  let l;
  let hval = 0x811c9dc5;
  // let hval = (seed === undefined) ? 0x811c9dc5 : seed;

  const asString = true;

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  if (asString) {
    // Convert to 8 digit hex string
    return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
  }
  return hval >>> 0;
};

export const isValue = value => R.not(R.or(R.isNil(value), R.isEmpty(value)));

export const nameValidator = name => {
  const error = name ? name.length === 0 : true;
  const errorMessage = error ? "Empty" : "";
  return { error, errorMessage };
};

export const emailValidator = email => {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const error = !regex.test(email);
  const errorMessage = error ? "Email is invalid!" : "";
  return { error, errorMessage };
};

export const passwordValidator = password => {
  const regex = /^.{6,}$/;
  const error = !regex.test(password);
  const errorMessage = error ? "Password must be at least 6 characters!" : "";
  return { error, errorMessage };
};

export const convert = dist => {
  if (R.isNil(dist)) return "";
  const distances = {
    6437: "4 M",
    8000: "8 K",
    1609: "1 M",
    16093: "10 M",
    5000: "5 K",
    5632: "3.5 M",
    42164: "26.2 M",
    10000: "10 K",
    21082: "13.1 M",
    15000: "15 K",
    100000: "100 K",
    30000: "30 K",
    80467: "50 M",
    160934: "100 M",
    50000: "50 K",
    18800: "18.8 K",
    217261: "135 M"
  };

  distances["42164"] = "Marathon";
  distances["21082"] = "Half marathon";

  const e = 0.01;
  const nearest = Object.keys(distances)
    .sort()
    .find(
      d =>
        parseInt(d) - e * parseInt(d) <= dist &&
        dist <= parseInt(d) + e * parseInt(d)
    );
  return typeof nearest !== "undefined"
    ? distances[nearest]
    : dist / 1000 + " K";
};

/* 
* calculate the pace 
* @param {Time} time: The time duration in format 8:27:08 
* @return {Time} time as milliseconds 30428000
*/
export const calculateTimestamp = time => {
  // calculate the time value as MILLIseconds
  let resultTime = time.toString().split('.'); 
  let timeTemp = resultTime[0].toString().split(':');
  let millisecond = resultTime.length == 1 ? 0 : parseInt(resultTime[1]);
  if (timeTemp.length === 2) 
  return (parseInt(timeTemp[0]) * 60 + parseInt(timeTemp[1])) * 1000 + millisecond * 10;
  else 
  return (parseInt(timeTemp[0]) * 3600 + parseInt(timeTemp[1]) * 60 + parseInt(timeTemp[2])) * 1000 + millisecond * 10;
};

/* 
* calculate the pace 
* @param {Time} time: as milliseconds 30428001
* @return {Time} time The time duration in format 8:27:08.1. Note that the milliseconds is rounded to 1 digit only.  
*/
export const calculateTime = timestamp => {
  // calculate the time as string of xx:xx:xx.x
  var hours = parseInt(timestamp/3600000);
  var mins = parseInt((parseInt(timestamp%3600000))/60000);
  var secs = parseInt((parseInt((parseInt(timestamp%3600000))%60000))/1000);
  var millisecs = parseInt((parseInt((parseInt(timestamp%3600000))%60000))%1000)/10;
  var milliRound = millisecs.toFixed(0);
  var oneDigit = (milliRound/(10**(milliRound.length-1))).toFixed(0);
  // console.log("timestamp, millisecs, milliRound, oneDigit", timestamp, " ", millisecs, milliRound, oneDigit );
  if (hours == 0)
    return mins.toString() + ':' + secs.toString() + '.' + oneDigit;
  return hours.toString() + ':' + mins.toString() + ':' + secs.toString() + '.' + oneDigit;
};

export const meter2mile = dist => {
   return dist * km2mile/1000;
};

/* 
* calculate the pace 
* @param {Time} duration The time duration in format 2:34:23
* @param {Meter} distance The race distance in meter 42164.81
* @return {Time} pace The total pace in format 8:51.3 
*/
export const calPace = (duration, distance) => {
  return calculateTime(calculateTimestamp(duration)/meter2mile(distance));
};
