module.exports = {
  friendlyName: 'Capitalize Words',
  description:
    'Capitalizes the first letter of each word in a hyphen-separated string.',
  sync: true,
  inputs: {
    inputString: {
      type: 'string',
      required: true,
      description: 'The input string to be formatted.'
    }
  },
  exits: {
    success: {
      description: 'Returns the formatted string.'
    }
  },
  fn: function (inputs, exits) {
    const words = inputs.inputString.split('-')
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    const formattedString = capitalizedWords.join(' ')
    return exits.success(formattedString)
  }
}
