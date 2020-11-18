module.exports = function (app) {

	var aws = require('aws-sdk')
	var fs = require('fs')
	var helper = require('./helpers')
	var ui = require('../models/uiDataModel')

	//middleware
	var bodyParser = require('body-parser')
	app.use(bodyParser.json())
	app.use(
		bodyParser.urlencoded({
			extended: true
		})
	)

	aws.config.loadFromPath(__dirname + '/../config/aws-config.json')
	var rekog = new aws.Rekognition({})

	// home page
	app.get('/', function (req, res) {
		helper.resetUI()
		ui.flow.timestamp = new Date(Date.now())
		res.setHeader('Content-Type', 'text/html')
		res.render('./index.ejs', {
			ui: ui
		})
	})

	// upload image
	app.post('/rekog', function (req, res) {

		ui.data.filename = req.body.filename
		ui.flow.activateDiv = ui.flow.activateDiv || 'label-result-div'
		ui.flow.activateButton = ui.flow.activateButton || 'label-button'

		var loadImage = function () {
			return new Promise(function (resolve, reject) {

				var fs = require('fs')
				var file = __dirname + '/../images/' + req.body.filename

				if (ui.debuginfo) console.log('==> reading image from file ' + file)
				fs.readFile(file, 'base64', (err, data) => {
					if (err) reject(err)
					else {
						buffer = new Buffer(data, 'base64')
						resolve(buffer)
					}
				})
			})

		}

		// detecting via label
		var detectLabels = function (buffer) {
			return new Promise(function (resolve, reject) {

				var params = {
					Image: {
						Bytes: buffer
					},
					MaxLabels: 20,
					MinConfidence: 60
				}
				rekog.detectLabels(params, function (err, data) {
					if (err) reject(err)
					else {
						var str = ''
						if (ui.debuginfo) console.log('==> rekog label data is ', JSON.stringify(data, null, 3))

						for (i = 0; i < data.Labels.length; i++) {
							str += data.Labels[i].Name + ' - Confidence ' + data.Labels[i].Confidence.toFixed(2) + '%\n'
						}
						resolve(str)
					}
				})
			})


		}

		// detecting via text
		var detectText = function (buffer) {
			return new Promise(function (resolve, reject) {

				var params = {
					Image: {
						Bytes: buffer
					}
				}

				rekog.detectText(params, function (err, data) {

					if (err) reject(err)
					else {
						str = ''
						if (ui.debuginfo) console.log('==> rekog text result data is', JSON.stringify(data, null, 3))

						for (i = 0; i < data.TextDetections.length; i++) {
							str += '(' + data.TextDetections[i].Type + ') ' + data.TextDetections[i].DetectedText + ' - Confidence ' + data.TextDetections[i].Confidence.toFixed(2) + '%\n'
						}
						resolve(str)
					}
				})
			})
		}

		// detect by face 
		var detectFace = function (buffer) {
			return new Promise(function (resolve, reject) {

				var params = {
					Attributes: ['ALL'],
					Image: {
						Bytes: buffer
					}
				}
				rekog.detectFaces(params, function (err, data) {

					if (err) reject(err)
					else {
						str = ''
						if (ui.debuginfo) console.log('==> rekog face result data is', JSON.stringify(data, null, 3))

						str = ''
						str += 'Faces detected:' + data.FaceDetails.length + '\n\n'

						for (i = 0; i < data.FaceDetails.length; i++) {
							face = i + 1
							str += 'Face(' + face + '):\n'
							str += 'Age between ' + data.FaceDetails[i].AgeRange.Low + ' and ' + data.FaceDetails[i].AgeRange.High + '\n'
							str += 'Smiling = ' + data.FaceDetails[i].Smile.Value + ', Confidence ' + data.FaceDetails[i].Smile.Confidence.toFixed(2) + '\n'
							str += 'Eyeglasses = ' + data.FaceDetails[i].Eyeglasses.Value + ', Confidence ' + data.FaceDetails[i].Eyeglasses.Confidence.toFixed(2) + '\n'
							str += 'EyesOpen = ' + data.FaceDetails[i].Eyeglasses.Value + ', Confidence ' + data.FaceDetails[i].EyesOpen.Confidence.toFixed(2) + '\n'
							str += 'Gender = ' + data.FaceDetails[i].Gender.Value + ', Confidence ' + data.FaceDetails[i].Gender.Confidence.toFixed(2) + '\n'
							str += 'Mustache = ' + data.FaceDetails[i].Mustache.Value + ', Confidence ' + data.FaceDetails[i].Mustache.Confidence.toFixed(2) + '\n'
							str += 'Sunglasses = ' + data.FaceDetails[i].Sunglasses.Value + ', Confidence ' + data.FaceDetails[i].Sunglasses.Confidence.toFixed(2) + '\n'

							str += 'Emotions:\n'
							for (j = 0; j < data.FaceDetails[i].Emotions.length; j++) {
								str += data.FaceDetails[i].Emotions[j].Type + ', Confidence ' + data.FaceDetails[i].Emotions[j].Confidence.toFixed(2) + '\n'
							}
							str += '\n'
						}
						resolve(str)
					}
				})
			})
		}

		loadImage().then(function resolveLoadImage(buffer) {

				Promise.all([detectLabels(buffer), detectText(buffer), detectFace(buffer)]).then(function resolveAll(arr) {
						
						ui.data.rekogResultLabel = arr[0]
						ui.data.rekogResultText = arr[1]
						ui.data.rekogResultFace = arr[2]
						res.render('./index.ejs', {
							ui: ui
						})

					},
					
					function rejectAll(err) {
						ui.data.rekogResultLabel = err
						res.render('./index.ejs', {
							ui: ui
						})
					})

			}, 
			function rejectLoadImage(err) {
				ui.data.rekogResultLabel = err
				res.render('./index.ejs', {
					ui: ui
				})
			})

	})
}