exports.getQueryForOffHour = (user, start, end) => ({
  $or: [
    { user: user, start: { $lte: start }, end: { $gte: start } },
    { user: user, start: { $lte: end }, end: { $gte: end } },
    { user: user, start: { $gte: start }, end: { $lte: end } },
  ],
});

exports.getQueryForAppointment = (user, start, end) => ({
  $or: [
    {
      admin: user,
      start: { $lte: start },
      end: { $gte: start },
      cancel: false,
    },
    { admin: user, start: { $lte: end }, end: { $gte: end }, cancel: false },
    {
      guest: user,
      start: { $lte: start },
      end: { $gte: start },
      cancel: false,
    },
    { guest: user, start: { $lte: end }, end: { $gte: end }, cancel: false },
    { admin: user, start: { $gte: start }, end: { $lte: end }, cancel: false },
    { guest: user, start: { $gte: start }, end: { $lte: end }, cancel: false },
  ],
});
