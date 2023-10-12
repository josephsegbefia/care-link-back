const express = require("express");
const Appointment = require("../models/Appoinment.model");

const UserProfile = require("../models/UserProfile.model");
const DoctorProfile = require("../models/DocProfile.model");

const router = express.Router();

// router.post("/appointments", (req, res, next) => {
//   const { user, doctor, date } = req.body;

//   Appointment.create({ userId: user, doctorId: doctor, date }).then(
//     (appointment) => {
//       UserProfile.findByIdAndUpdate(user, {
//         $push: { appointments: appointment._id }
//       })
//         .then((appointment) => {
//           DoctorProfile.findByIdAndUpdate(doctor, {
//             $push: { appointments: appointment._id }
//           }).then(() => {
//             res.status(200).json({ appointment });
//           });
//         })
//         .catch((error) => {
//           console.log(error);
//           res.status(500).json({ message: "Internal Server Error" });
//         });
//     }
//   );
// });

router.post("/appointments", async (req, res, next) => {
  try {
    const { user, doctor, date } = req.body;
    const appointment = await Appointment.create({
      userId: user,
      doctorId: doctor,
      date
    });

    await UserProfile.findOneAndUpdate(
      { user: user },
      {
        $push: { appointments: appointment._id }
      }
    );
    await DoctorProfile.findOneAndUpdate(
      { doctor: doctor },
      {
        $push: { appointments: appointment._id }
      }
    );

    res.status(200).json({ appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/appointments/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({
      $or: [{ _id: id }, { userId: id }, { doctorId: id }]
    });
    if (appointment) {
      res.status(200).json(appointment);
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/appointments/:appointmentId/edit", async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { date } = req.body;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment does not exist" });
    }

    // Update the date
    appointment.date = date;

    // Save the updated appointment
    const updatedAppointment = await appointment.save();
    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.log("Error updating the appointment", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = router;
