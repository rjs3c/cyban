/**
 * export.js
 * 
 * Provides a class of methods for exporting data to files of various formats.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// HTTP Status Codes module.
const { StatusCodes } = require('http-status-codes'),
    // 'logplease' Logger.
    logger = require('logplease').create('server'),
    // 'Entries' MongoDB Schema.
    entries = require('../models/entries'),
    // Stream module.
    Stream = require('stream'),
    // Path module.
    path = require('path'),
    // PDFKit module.
    PDFDocument = require('pdfkit');

module.exports = class Exports {

	/**
	 * 
	 * Export data to a PDF format.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	static async exportToPDF (req, res, next) {
		try {
            const { filename } = req.query;

            if (!filename) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'Could not export to PDF.' });

			const executive_summary = new PDFDocument({ bufferPages: true });

            let stream_buf = [];

            executive_summary
            // Generates a file stream, providing this as a buffer in the response body. 
            .on('data', stream_buf.push.bind(stream_buf))
            .on('end', () => {
                let pdf_stream = Buffer.concat(stream_buf),
                    read_stream = new Stream.PassThrough();

                read_stream.end(pdf_stream);

                res
                // Required HTTP headers in order for this to be downloaded by clients.
                .set('Content-Disposition', `attachment;filename=${filename}.pdf`)
                .set('Content-Type', 'application/pdf')
                .set('Content-Length', Buffer.byteLength(pdf_stream));

                read_stream.pipe(res);
            });

            // Document Heading
            executive_summary
            .polygon([0, 0], [0, 100], [200, 0]).fillAndStroke('gray', 'gray').stroke()
            .image(path.join(__dirname,'..', '..', 'public', 'images', 'cyban-logo.png'), 25, 25, {
                fit: [150, 300],
            })
            .moveDown(2)
            .font('Helvetica-Bold').fontSize(30).fillColor('black')
            .text('Executive Summary', {
                align: 'right',
            })
            .fontSize(15).fillColor('grey')
            .text(`Dated: ${new Date().toDateString()}`, {
                align: 'right'
            })
            .moveDown(2)
            .fillAndStroke('grey', 'grey')
            .moveTo(30, 200).lineTo(550, 200).stroke();

            const retrieved_entries = await Exports.getEntries();

            // Document Body
            if (retrieved_entries.length === 0) {
                executive_summary
                .moveDown(2)
                .font('Helvetica-Bold').fontSize(15).fillColor('red')
                .text('Error: No entries exist.', {
                    align: 'center',
                });
            } else {
                let todo_count = 0,
                    pending_count = 0,
                    done_count = 0,
                    risk_todo_count = 0,
                    vulnerability_todo_count = 0,
                    event_todo_count = 0,
                    total_count = retrieved_entries.length;

                // Performs arithmetic and counting for the summaries.
                retrieved_entries.forEach(entry => {
                    switch (entry.entry_status) {
                        case 'todo':
                            todo_count++;
                            switch (entry.entry_category) {
                                case 'risk':
                                    risk_todo_count++;
                                    break;
                                case 'vulnerability':
                                    vulnerability_todo_count++;
                                    break;
                                case 'event':
                                    event_todo_count++;
                                    break;
                                default:
                                    break;
                            }
                            break;
                        case 'pending':
                            pending_count++;
                            break;
                        case 'done':
                            done_count++;
                            break;
                        default:
                            break; 
                    }
                });

                // Progress Summary.
                executive_summary
                .moveDown(2)
                .lineWidth(200)
                .lineCap('square')
                .fillAndStroke('#D3D3D3')
                .moveTo(170, 320).lineTo(430, 320).stroke()
                .lineWidth(40)
                .lineCap('square')
                .fillAndStroke('#70A3CC')
                .moveTo(80, 250).lineTo(300, 250).stroke()
                .font('Helvetica-Bold').fontSize(15).fillColor('#00304E')
                .text('Progress Summary', 120, 245, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(30).fillColor('#70A3CC')
                .text(`${(todo_count / total_count * 100).toFixed(2)}%`, 100, 300, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(12).fillColor('#70A3CC')
                .text(`${todo_count} items TODO`, 100, 360, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(12).fillColor('#70A3CC')
                .text(`out of ${total_count} items.`, 100, 375, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(30).fillColor('#FAB57F')
                .text(`${(pending_count / total_count * 100).toFixed(2)}%`, 250, 300, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(12).fillColor('#FAB57F')
                .text(`${pending_count} items PENDING`, 250, 360, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(12).fillColor('#FAB57F')
                .text(`out of ${total_count} items.`, 250, 375, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(30).fillColor('#3CB371')
                .text(`${(done_count / total_count * 100).toFixed(2)}%`, 400, 300, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(12).fillColor('#3CB371')
                .text(`${done_count} items DONE`, 400, 360, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(12).fillColor('#3CB371')
                .text(`out of ${total_count} items.`, 400, 375, {
                    align: 'left',
                });

                // Security Summary.
                executive_summary
                .moveDown(2)
                .lineWidth(200)
                .lineCap('square')
                .fillAndStroke('#D3D3D3')
                .moveTo(170, 550).lineTo(430, 550).stroke()
                .lineWidth(40)
                .lineCap('square')
                .fillAndStroke('#FF7377')
                .moveTo(80, 480).lineTo(300, 480).stroke()
                .font('Helvetica-Bold').fontSize(15).fillColor('#8B0000')
                .text('Security Summary', 120, 475, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(30).fillColor('#FF7377')
                .text(`${risk_todo_count}`, 130, 530, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(12).fillColor('#FF7377')
                .text('risks unaddressed.', 80, 590, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(30).fillColor('#FF7377')
                .text(`${vulnerability_todo_count}`, 290, 530, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(12).fillColor('#FF7377')
                .text(`vulnerabilities unaddressed.`, 220, 590, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(30).fillColor('#FF7377')
                .text(`${event_todo_count}`, 450, 530, {
                    align: 'left',
                })
                .font('Helvetica-Bold').fontSize(12).fillColor('#FF7377')
                .text(`events unaddressed.`, 400, 590, {
                    align: 'left',
                });
            }
                    
            executive_summary
            .end();

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Could not export to PDF.' });
		}
	}

    // Retrieves all entries stored within the 'Entries' schema.
    static async getEntries() {
        return await entries
        .find({})
        .sort('createdAt');
    }
}