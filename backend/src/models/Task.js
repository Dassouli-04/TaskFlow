const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
      maxlength: 200
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    priority: {
      type: String,
      enum: {
        values: ["basse", "moyenne", "haute"],
        message: "La priorité doit être : basse, moyenne ou haute"
      },
      default: "moyenne"
    },

    status: {
      type: String,
      enum: {
        values: ["à faire", "en cours", "terminé"],
        message: "Le statut doit être : à faire, en cours ou terminé"
      },
      default: "à faire"
    },
    // tache 4 ******************************************************

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    ///////////****************************************************** */
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Le projet est obligatoire"]
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    deadline: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Task", taskSchema);