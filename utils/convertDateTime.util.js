exports.convertTime = (time) => {
  return time.toLocaleTimeString("en-US", {
    hour12: true,
    minute: "2-digit",
    hour: "numeric",
  });
};

exports.convertDate = (time) => {
  return time.toLocaleDateString("en-US", {
    day: "numeric",
    weekday: "short",
    month: "short",
    year: "numeric",
  });
};
