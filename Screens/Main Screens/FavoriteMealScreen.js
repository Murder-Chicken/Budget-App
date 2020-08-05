import React, {useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../components/Header';
import {Dimensions} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import Slider from '@react-native-community/slider';



  const FavoriteMealScreen = (props) => {

    const [ sliderValue, setSliderValue ] = useState(0);

    return (
      <View style={styles.screen}>
        <Header title="Student Loan Calculator" />
        <View style={styles.screen}>
        <Slider
    style={{width: 200, height: 40}}
    minimumValue={1}
    maximumValue={30}
    step={1}
    minimumTrackTintColor="#FFFFFF"
    maximumTrackTintColor="#000000"
    onValueChange={value => setSliderValue(value)}
  />
  <Text>Value = {sliderValue}</Text>
        <LineChart
  data={{
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
    ],
    datasets: [
      {
        data: [100, 45, 28, 80, 99, 43],
        strokeWidth: 2,
      },
    ],
  }}
  width={Dimensions.get('window').width - 16}
  height={220}
  chartConfig={{
    backgroundColor: '#1cc910',
    backgroundGradientFrom: '#eff3ff',
    backgroundGradientTo: '#efefef',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  }}
  style={{
    marginVertical: 8,
    borderRadius: 16,
  }}
/>
        </View>
      </View>
    );
  };
  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }
  });



export default FavoriteMealScreen;
