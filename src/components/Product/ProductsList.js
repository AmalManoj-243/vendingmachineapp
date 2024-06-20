import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import Text from '@components/Text';
import { FONT_FAMILY } from '@constants/theme';

const ProductsList = ({ item, onPress }) => {
    const errorImage = require('@assets/images/error/error.png');
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setImageLoading(false);
        }, 10000); // Adjust the timeout as needed

        return () => clearTimeout(timeout);
    }, []);

    const truncatedName =
        item?.product_name?.length > 35 ? item?.product_name?.substring(0, 60) + '...' : item?.product_name;

    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            {imageLoading && <ActivityIndicator size="small" color="black" style={styles.activityIndicator} />}
            <Image
                source={item?.image_url ? { uri: item.image_url } : errorImage}
                style={styles.image}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
            />
            <View style={styles.textContainer}>
                <Text style={styles.name}>{truncatedName?.trim()}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default ProductsList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        margin: 6,
        borderWidth: 0.5,
        borderRadius: 10,
        paddingVertical: 10,
        borderColor: 'grey',
        backgroundColor: 'white',
        width: 150,  // Set a fixed width
        height: 180, // Adjusted height to make space for text
    },
    activityIndicator: {
        position: 'absolute',
        top: 30,
        left: 50,
    },
    image: {
        width: 85,  // Adjusted width as necessary
        height: 100, // Adjusted height as necessary
        resizeMode: 'contain',
        borderRadius: 8,
        alignSelf: 'center',  // Center image horizontally
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        // paddingVertical: 5,
    },
    name: {
        fontSize: 12,
        textAlign: 'center',
        textTransform: 'capitalize',
        color: '#2E2B2B',
        fontFamily: FONT_FAMILY.urbanistBold,
    },
});
