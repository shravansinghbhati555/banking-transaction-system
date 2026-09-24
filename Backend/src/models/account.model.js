const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        accountNumber: {
            type: String,
            unique: true,
            required: true
        },

        status: {
            type: String,
            enum: ["ACTIVE", "BLOCKED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);


// Generate Account Number
accountSchema.pre("validate", async function () {

    // Agar already account number hai
    // to kuch mat karo
    if (this.accountNumber) {
        return;
    }


    let accountNumber;
    let exists = true;


    // Unique account number generate karo
    while (exists) {

        accountNumber =
            "100000" +
            Math.floor(
                100000 + Math.random() * 900000
            );


        exists = await mongoose.models.account.findOne({
            accountNumber: accountNumber
        });

    }


    this.accountNumber = accountNumber;

});

// Get account balance from ledger
accountSchema.methods.getBalance = async function () {

    const ledgerModel = mongoose.model("ledger");

    const result = await ledgerModel.aggregate([
        {
            $match: {
                account: this._id
            }
        },
        {
            $group: {
                _id: null,

                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"] },
                            "$amount",
                            0
                        ]
                    }
                },

                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        }
    ]);


    if (result.length === 0) {
        return 0;
    }


    return result[0].totalCredit - result[0].totalDebit;
};


const accountModel =
    mongoose.model("account", accountSchema);


module.exports = accountModel;