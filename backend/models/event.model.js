import mongoose from 'mongoose';

const types = ['Irrigation Activation', 'Data Submission', 'Seedling Sow', 'Seedling Ready'];
const reservoirLevels = ['OK', 'LOW', 'FULL'];
const waterLevels = ['OK', 'LOW', 'FULL']

const EventSchema = new mongoose.Schema({
    device:{
        type: mongoose.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    eventDate:{
        type: Number,
        required: true,
        default: Date.now()
    },
    eventType:{
        type: String,
        enum: types,
        required: true,
        default: 'Data Submission'
    },
owner:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
},
ultrasonic1:{

    type: Number,
    required: true,
    default: 0
},
ultrasonic2:{

    type: Number,
    required: true,
    default: 0

},
ultrasonic3:{

    type: Number,
    required: true,
    default: 0

},
});

const Event=mongoose.model('Event', EventSchema);

export default Event;