import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    fixedRatio: {
        backgroundColor: 'rebeccapurple',
        flex: 1,
        aspectRatio: 1
      },

      loanBoxes: {
        width: 340,
        height: 120,
        marginTop: 50,
        marginLeft: 30,
        //borderColor: '#32c090',
        //borderWidth: 1,
        backgroundColor: 'white',
      },

      loanInside1: {
        fontWeight: 'bold',
        fontSize: 25,
        paddingLeft: 10,
        paddingTop: 5,
        color: '#426FFE'
      },

      loanInside2: {
        fontWeight: 'bold',
        fontSize: 25,
        paddingLeft: 80,
        paddingTop: 5,
        color: '#426FFE'
      },

      loanInside3: {
        paddingLeft: 18,
        fontSize: 17,
        color: '#426FFE'
      },

      loanInside4: {
        paddingLeft: 28,
        fontSize: 17,
        color: '#426FFE'
      },

      loanInside5: {
        paddingLeft: 18,
        fontSize: 17,
        paddingTop: 7,
        color: '#426FFE'
      },

      loanInside6: {
        paddingLeft: 28,
        fontSize: 17,
        paddingTop: 7,
        color: '#426FFE'
      },

    na: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        backgroundColor: 'orange',
        alignItems: 'center',
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
        fontSize: 15,
        textAlignVertical: 'center',
        marginRight: 10,
        overflow: 'hidden',
    },
})