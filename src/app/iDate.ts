interface Date {
  addHours: (hours: number) => Date;
}

Date.prototype.addHours = function (hours: number) {
  this.setTime(this.getTime() + (hours * 60 * 60 * 1000));
  return this;
}
