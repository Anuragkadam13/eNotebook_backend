const express = require("express");
const router = express.Router();
const { validationResult, body } = require("express-validator");
const fetchuser = require("../middlewares/fetchuser");
const Note = require("../models/Note");

//ROUTE 1: Get all the notes using GET: "/api/notes/fetchallnotes". Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error..");
  }
});

//ROUTE 2: Add a new Note using POST: "/api/notes/addnote". Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title").isLength({ min: 3 }).withMessage("Enter a valid title"),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Description must have 5 characters"),
  ],
  async (req, res) => {
    try {
      const result = validationResult(req);
      //Shows error and bad request if there is any..
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
      const { title, description, tag } = req.body;
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error..");
    }
  }
);

//ROUTE 3: Update existing Note using PUT: "/api/notes/updatenote/:id". Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    //Create a new noteNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //Find the note to be updated and update it

    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error..");
  }
});

//ROUTE 4: Delete an existing Note using DELETE: "/api/notes/deletenote/:id". Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //Find the note to be deleted and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    //Allow deletion only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "the note has been deleted", note: note });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error..");
  }
});

module.exports = router;
