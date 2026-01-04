import User from '../models/user.model.js';
import Device from '../models/device.model.js';
import axiosInstance from '../config/axiosConfig.js';

export const isUserEmailExisting = async (email, idToExcempt) =>{
    try{
        const user=await User.find({emailAddress: email});

        if(!user || user.length<1){
            return false;
        }else if(idToExcempt == user[0]._id){
            return false;
        }else{
            return true;
        }
    }catch(error){
        console.error("Error in checking existence of User email! - "+error.message);
        error.message = "Server Error!\n"+error.message;
        throw(error);
    }
}


export const isDeviceIDExisting = async (devID, idToExcempt) =>{
    try{
        const device=await Device.find({deviceID: devID});

        if(!device || device.length<1){
            return false;
        }else if(idToExcempt == device[0]._id){
            return false;
        }else{
            return true;
        }
    }catch(error){
        console.error("Error in checking existence of Device ID! - "+error.message);
        error.message = "Server Error!\n"+error.message;
        throw(error);
    }
}

export const isDateValid = async (stringInput) =>{
    if(typeof stringInput != 'string'){
        return false;
    }

    const tokens = stringInput.split("-");
    if(tokens.length != 3){
        return false;
    }

    for(var i=0; i<tokens.length; i++){
        if(isNaN(tokens[i]))
            return false;
    }

    if(tokens[0]<999)
        return false;

    if(tokens[1]<1 || tokens[1]>12)
        return false;

    if(tokens[2]<1)
        return false;
    else if(tokens[1] == 2 && tokens[2]>29)
        return false;
    else if((tokens[1] == 1 || tokens[1] == 3 || tokens[1] == 5 || tokens[1] == 7 || tokens[1] == 8 || tokens[1] == 10 || tokens[1] == 12) && tokens[2] > 31)
        return false;
    else if((tokens[1] == 4 || tokens[1] == 6 || tokens[1] == 9 || tokens[1] == 11) && tokens[2] > 30)
        return false;
    
    return true;
}

export const isAddressValid = async(regCode, provCode, citymunCode, brgyCode) =>{
    if(typeof regCode != 'number' || Number.isNaN(regCode)){
        return false;
    }

    if(typeof provCode != 'number' || Number.isNaN(provCode)){
        return false;
    }

    if(typeof citymunCode != 'number' || Number.isNaN(citymunCode)){
        return false;
    }

    if(typeof brgyCode != 'number' || Number.isNaN(brgyCode)){
        return false;
    }

    try{
        const params={"barangayID": brgyCode};
        const result = await axiosInstance.post("/barangay/by-barangay-code", params, {withCredentials: true});

        if(!result.data.success || result.data.data.length<1){
            return false;
        }else{
            const brgyObj=result.data.data[0];

            if(regCode !== brgyObj.regCode){
                return false;
            }

            if(provCode !== brgyObj.provCode){
                return false;
            }

            if(citymunCode !== brgyObj.citymunCode){
                return false;
            }

            return true;
        }
    }catch(error){
        console.error("Error trying to check if address is valid: ", error.message);
        return false;
    }
}

export const isTokenValid = async(token) =>{
    if (!token) return false;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return !!decoded?.id;
        
    } catch (error) {
        return false;
    }
}