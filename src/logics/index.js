import { Asset, Font } from 'expo';
import { Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import Firebase from './firebase';

export function cacheImages(images) {
    return images.map(image => {
        if (typeof image === 'string') {
        return Image.prefetch(image);
        } else {
        return Asset.fromModule(image).downloadAsync();
        }
    });
}
  
export function cacheFonts(fonts) {
    return fonts.map(font => Font.loadAsync(font));
}

export async function loadAssetsAsync(){
    const imageAssets = cacheImages([
        'https://dgtzuqphqg23d.cloudfront.net/UscoKxvxNJL4MbbWYIxluvm3sESCPo9sP9xHQZnADdI-2048x1536.jpg',
        'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    ]);

    const fontAssets = cacheFonts([FontAwesome.font]);

    await Promise.all([...imageAssets, ...fontAssets]);
}

export const engine = Firebase;