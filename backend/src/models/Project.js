const mongoose = require("mongoose");
const Task = require("./Task");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    deadline: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["actif", "en pause", "archivé"],
      default: "actif"
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    //////////////////////  tache 4  ///////////////////
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }], 
    ////////////////////////////////////////////
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

projectSchema.pre("deleteOne", { document: true, query: false }, async function () {
    await Task.deleteMany({ project: this._id });
 });

module.exports = mongoose.model("Project", projectSchema);