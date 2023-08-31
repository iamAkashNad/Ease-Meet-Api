exports.getQueryForOffHour = (user, start, end) => ({
  $or: [
    { user: user, start: { $lte: start }, end: { $gte: start } },
    { user: user, start: { $lte: end }, end: { $gte: end } },
    { user: user, start: { $gte: start }, end: { $lte: end } }
  ],
});

exports.getQueryForAppointment = (user, start, end) => ({
  $or: [
    {
      admin: user,
      start: { $lte: start },
      end: { $gte: start },
    },
    { admin: user, start: { $lte: end }, end: { $gte: end } },
    {
      guest: user,
      start: { $lte: start },
      end: { $gte: start },
    },
    { guest: user, start: { $lte: end }, end: { $gte: end } },
    { admin: user, start: { $gte: start }, end: { $lte: end } },
    { guest: user, start: { $gte: start }, end: { $lte: end } }
  ],
});
