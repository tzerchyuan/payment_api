var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
  id: String,
  from_acc: String,
  to_acc: String,
  amount: Number,
  validity: Boolean
});

module.exports = mongoose.model('Transaction', TransactionSchema);
