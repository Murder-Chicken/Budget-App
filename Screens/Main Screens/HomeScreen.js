import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Modal, ScrollView, FlatList } from 'react-native';
import GoalItem from '../../components/HomeScreen/GoalItem';
import GoalInput from '../../components/HomeScreen/GoalInput';
import Header from '../../components/Header';
import { firebase } from '../../Constants/ApiKeys';
import FavoriteMealScreen from './FavoriteMealScreen'
import AsyncStorage from '@react-native-community/async-storage'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system';

import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { set } from 'react-native-reanimated';

const Stack = createStackNavigator();

const HomeScreen = (props) => {
	const [ courseGoals, setCourseGoals ] = useState([]);
	const [ isAddMode, setIsAddMode ] = useState(false);
	const [goalCounter, setGoalCounter] = useState(0)
	const [pw, setPW] = useState('')
	const [userOut, setUserOut] = useState("")
	//const [docIDS, setDocIDS] = useState([])

	const userId = props.extraData.id;
	const loansRef = firebase.firestore().collection('goals');

	const onFooterLinkPress = () => {
		props.navigation.navigate('Loan Calculator')
	}

	const onFooterLinkPress2 = () => {
		props.navigation.navigate('Loan Home')
	}

	const onFooterLinkPress3 = () => {
		props.navigation.navigate('Budget')
	}

	const getPW = async () => {
		try {
			const currPW = await AsyncStorage.getItem('password')
			if(currPW !== null){
				setPW(currPW)
			}	
		}catch (error){console.log(error)}
	}

	const clearPW = async() => {
		try{
			await AsyncStorage.removeItem('password')
			console.log('removed successfully')
		}catch(error){console.log(error)}
	}
	
	const onDeleteAccountPress = () => {
		var userReauth = firebase.auth().currentUser
		const credential = firebase.auth.EmailAuthProvider.credential(userReauth.email,pw)
		userReauth.reauthenticateWithCredential(credential)
		if(courseGoals.length !== 0){
			//console.log(courseGoals[i])
			//firebase.database().ref('goals/'+ userId).remove()
			loansRef.doc(userId).delete()
			firebase.firestore().collection('users').doc(userId).delete()
		}
		userReauth.delete()
		.then(function(){
			props.navigation.navigate('Login');
			props.navigation.reset({ index: 0, routes: [ { name: 'Login' } ] });
		}).catch(function(error){
			console.log('there is something wrong')
		})
		clearPW()
	}

	const pickDocument = async () => {
		try {
			let input = await DocumentPicker.getDocumentAsync({
				type: "text/plain",
			})
			setUserOut(await FileSystem.readAsStringAsync(input.uri))
			createLoans()
		} catch (error) {
			console.log(error);
		}
	}

	const fileParser = () => {
		const parsedLoans = [];
		var newUserOut = userOut;

		if (newUserOut.length == 0) {
			return;
		}
		//remove the grants
		var grantPos = newUserOut.search("Grant Type:");
		var pos = newUserOut.search("Loan Type:");
		//hopefully just the loans now
		newUserOut = newUserOut.slice(pos, grantPos);

		while (newUserOut.length > 0) {
			var lastPos = newUserOut.lastIndexOf("Loan Type:");
			parsedLoans.push(newUserOut.slice(lastPos, newUserOut.length));
			newUserOut = newUserOut.slice(0, lastPos);
		}
		//console.log('parsed loans: ' + parsedLoans)
		return parsedLoans;
	};

	const createLoans = () => {
		const newLoans = fileParser();
		const title= 'Loan Amount:$'
		const interest = 'Loan Interest Rate:'

		for(let i =1; i <= newLoans.length; i++){
			let loan = newLoans[i]
			let goalTitle=loan.substring(loan.indexOf(title)+title.length,loan.indexOf('Loan Disbursed Amount:'))
			//console.log("goalTitle: " + goalTitle)
			let interestRate = loan.substring(loan.indexOf(interest)+interest.length,loan.indexOf('Loan Repayment Plan Type'))
			//console.log("Interest rate: "+ interestRate)
			let years = 10
			let paidOff = 50
			setGoalCounter(goalCounter+1)
			let id =i
			addGoalHandler(goalTitle,interestRate,years,paidOff,id)
		}
		return
    
	};


	useEffect(() => {
		getPW()
		let isMounted = true;

		if (isMounted) {
			loansRef.doc(userId).onSnapshot(
				(docSnapshot) => {
					if(!docSnapshot.exists){console.log('doc doesnt exist, start from scratch')}
					else{
						console.log('loaded successfully '+docSnapshot.data())
						console.log(docSnapshot.data().goals.length)
						if(courseGoals.length !== docSnapshot.data().goals.length){
							setCourseGoals(docSnapshot.data().goals)
							setGoalCounter(docSnapshot.data().goals.length)
						}
						console.log(goalCounter)
					}
				},
				(error) => {
					console.log(error);
				}
			);
		}
		return () => {
			isMounted = false;
		};
	}, []);

	const onLogoutPress = () => {
		firebase
			.auth()
			.signOut()
			.then(() => {
				props.navigation.navigate('Login');
				props.navigation.reset({ index: 0, routes: [ { name: 'Login' } ] });
			})
			.catch((error) => {
				alert(error);
			});
	};

	const addGoalHandler = (goalTitle, interestRate, years, paidOff,id) => {
		console.log(goalCounter)
		setGoalCounter(goalCounter+1)
		setCourseGoals((courseGoals) => [
			...courseGoals,
			{
				id: userId +id.toString(),
				value: goalTitle,
				interest: interestRate,
				years: years,
				paidOff: paidOff
			}
		]);
		//console.log(goalCounter)
		addToFB(goalTitle, interestRate,years,paidOff,id)
		setIsAddMode(false);
	}

	const cancelGoalAdditionHandler = () => {
		setIsAddMode(false);
	}

	const addToFB = async (goalTitle, interestRate, years, paidOff,id) => {
		//adding data to firebase, takes into account if doc exists already 
		const loadDoc = await loansRef.doc(userId).get()
			.then((docSnapshot)=> {
				if(docSnapshot.exists){
					loansRef.doc(userId).onSnapshot((docu)=>{
						const updateLoansArr = loansRef.doc(userId).update({
							goals: firebase.firestore.FieldValue.arrayUnion({
								id: userId+id.toString(),
								value: goalTitle,
								interest: interestRate,
								years: years,
								paidOff: paidOff
							})
						})
					})
				}
				else{
					const addDoc = loansRef.doc(userId).set({
						goals: firebase.firestore.FieldValue.arrayUnion({
						id: userId+id.toString(),
						value: goalTitle,
						interest: interestRate,
						years: years,
						paidOff: paidOff
					})
				})
			}})
	}

	const removeGoalHandler = async (goalId) => {
		let goalToDel = {}
		for(let i =0; i < courseGoals.length; i++){
			if(courseGoals[i].id == goalId){
				goalToDel = courseGoals[i]
				console.log(goalToDel)
			}
		}
		const removeGoal = await loansRef.doc(userId).update({
			goals: firebase.firestore.FieldValue.arrayRemove(goalToDel)
		})
		
		//ask sam to explain this
		setCourseGoals((courseGoals)=> {
			return courseGoals.filter((goal)=> goal.id !== goalId)
		})
		setGoalCounter(goalCounter-1)
	}

	return (
		<ScrollView style={styles.screen}>
			<Header title="Student Loan Calculator" />

			<View style={{ padding: 20 }}>
				<Text style={styles.title}> LOANS: </Text>

				<GoalInput visible={isAddMode} addGoalHandler={addGoalHandler} onCancel={cancelGoalAdditionHandler} />

				<FlatList
					keyExtractor={(item, index) => item.id}
					data={courseGoals}
					renderItem={(itemData) => (
						<GoalItem
							onDelete={removeGoalHandler.bind(this, itemData.item.id)}
							title={itemData.item.value}
							subInterest={itemData.item.interest}
							subPaid={itemData.item.paidOff}
							subYears={itemData.item.years}
						/>
					)}
				/>
				<Button title="Add New Loan" onPress={() => setIsAddMode(true)} />
				<Text style={styles.title}> SHINY GRAPH/SLIDER: </Text>
				<FavoriteMealScreen/>

				<TouchableOpacity title='Loan Calculator' onPress={onFooterLinkPress}> 
					<Text style={{
						fontWeight: 'bold',
						fontSize: 20,
						color: '#32c090',
						textAlign: 'center',
						paddingTop: 20
					}}>
						Loan Calculator
					</Text>
				</TouchableOpacity>

				<TouchableOpacity title='Loan Calculator' onPress={onFooterLinkPress2}> 
					<Text style={{
						fontWeight: 'bold',
						fontSize: 20,
						color: '#32c090',
						textAlign: 'center',
						paddingTop: 20
					}}>
						Loan Home Screen Prototype
					</Text>
				</TouchableOpacity>

				
				<TouchableOpacity title='Budget Page' onPress={onFooterLinkPress3}> 
					<Text style={{
						fontWeight: 'bold',
						fontSize: 20,
						color: '#32c090',
						textAlign: 'center',
						paddingTop: 20
					}}>
						Budgeting
					</Text>
				</TouchableOpacity>

				<TouchableOpacity title= 'Delete User' onPress={onDeleteAccountPress}>
					<Text style={{
						fontWeight: 'bold',
						fontSize: 20,
						color: '#32c090',
						textAlign: 'center',
						paddingTop: 20
					}}>
						Delete Account
					</Text>
				</TouchableOpacity>

				<TouchableOpacity title= 'Upload Doc' onPress={pickDocument}>
					<Text style={{
						fontWeight: 'bold',
						fontSize: 20,
						color: '#32c090',
						textAlign: 'center',
						paddingTop: 20
					}}>
						Upload Document
					</Text>
				</TouchableOpacity>

			</View>
			<View style={styles.logout}>
				<Button style={styles.logout} title="Logout" onPress={() => onLogoutPress()} />
			</View>


			
		</ScrollView>

	);

};
const styles = StyleSheet.create({
	screen: {
		flex: 1
		//backgroundColor: '#060320'
	},
	title: {
		//color: '#35CA96',
		fontSize: 22,
		margin:15,
		fontWeight: 'bold'
	},
	logout: {
		//	position: 'absolute',
		//marginBottom: 'auto'

		flex: 1,
		justifyContent: 'flex-end'
		//marginBottom: 500
	},

});

export default HomeScreen;

