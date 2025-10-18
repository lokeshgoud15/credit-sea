import mongoose from 'mongoose';
const { Schema } = mongoose;


const CreditAccountSchema = new Schema({
type: { type: String },
institution: { type: String },
address: { type: Schema.Types.Mixed },
accountNumber: { type: String },
amountOverdue: { type: Number, default: 0 },
currentBalance: { type: Number, default: 0 }
});


const ReportSchema = new Schema({
basic: {
name: String,
mobilePhone: String,
pan: { type: String, index: true },
creditScore: Schema.Types.Mixed
},
summary: {
totalAccounts: Number,
activeAccounts: Number,
closedAccounts: Number,
currentBalanceAmount: Number,
securedAccountsAmount: Number,
unsecuredAccountsAmount: Number,
last7DaysEnquiries: Number
},
creditAccounts: [CreditAccountSchema],
uploadedAt: { type: Date, default: Date.now },
raw: { type: Schema.Types.Mixed }
});


export default mongoose.model('Report', ReportSchema);