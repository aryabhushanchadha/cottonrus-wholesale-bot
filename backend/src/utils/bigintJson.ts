// Prisma returns BigInt for the Customer.telegramId column, but JSON.stringify
// throws on BigInt by default. Telegram user ids always fit safely in a
// string representation for API responses.
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export {};
