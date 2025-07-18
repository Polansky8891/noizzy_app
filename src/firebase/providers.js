import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FirebaseAuth } from "./config";


const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: 'select_account'
});


export const signInWithGoogle = async() => {

    try {

        const result = await signInWithPopup( FirebaseAuth, googleProvider );

        const { displayName, email, photoUrl, uid } = result.user;

        return {
            ok: true,
            displayName, email, photoUrl, uid
        }
        
    } catch (error) {

        const errorCode = error.code;
        const errorMessage = error.message;

        return {
            ok: false,
            errorMessage
        }
        
    }
}