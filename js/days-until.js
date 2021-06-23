function daysUntil(date) {
    const oneDay = 24 * 60 * 60 * 1000
    const firstDate = new Date();
    const secondDate = new Date(date);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}