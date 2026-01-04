import Device from '../models/device.model.js';


const checkOfflineDevices = async() => {
    try{
        const devices = await Device.find({"isOnline": true});
        if(!devices instanceof Array || devices.length === 0){
            return;
        }

        const timeNow = Date.now();
        const idleTimeThreshold = 30 * 1000;

        for(var i=0; i<devices.length; i++){
            const device = devices[i];
            try{
                if(timeNow >= (device.lastUpdate+idleTimeThreshold)){
                    device.isOnline=false;
                    await Device.findByIdAndUpdate(device._id, device, {new: true});
                }
            }catch(e){
                console.error("An error occured while checking status of device: "+device.deviceID);
            }
        }

    }catch(error){
        console.error("Error trying to check the status of all devices from Database!");
    }
}

export default checkOfflineDevices