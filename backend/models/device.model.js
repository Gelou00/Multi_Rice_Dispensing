import mongoose from 'mongoose';


const DeviceSchema = new mongoose.Schema({
    deviceID:{ 
          type: String,
          require:true
    },
isOnline:{
     type:Boolean,
     default:false
},
lastUpdate:{
    type: Number,
    require: true,
    default: 0
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


 const Device = mongoose.model('Device', DeviceSchema);

export default Device;