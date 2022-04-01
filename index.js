const http = require('http')
const fs = require('fs')
const URL = require('url')
const { guardarUsuario, getUsuarios, editarUsuario, eliminarUsuario, registrarTransferencia, getTransferencias } = require('./consultas')

http.createServer(async (req, res) => {

    const url = req.url

    if (url == '/' && req.method == 'GET') {
        
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.statusCode = 500
                res.end()
            }else{
                res.setHeader('Content-type', 'text/html')
                res.end(data)
            }
        })

    }

    // registro de usuarios
    if (url == '/usuario' && req.method == 'POST') {
        let body = ''

        req.on('data', (chunk) => {
            body = chunk.toString()
        })

        req.on('end', async () => {
            const usuario = JSON.parse(body)

            try {

                const result = await guardarUsuario(usuario)
                res.statusCode = 201
                res.end(JSON.stringify(result))

            } catch (e) {

                res.statusCode = 500
                res.end('ERROR! en el registro de usuarios... ' + e)
                
            }
        })
    }

    // obtiene los registros
    if (url == '/usuarios' && req.method == 'GET') {

        try {

            const usuario = await getUsuarios()
            res.end(JSON.stringify(usuario))

        } catch (e) {
            
            res.statusCode = 500
            res.end('ERROR! al traer los registros... ' + e)

        }

    }

    // edita los registros
    if (url.startsWith('/usuario?id') && req.method == 'PUT') {
        let body = ''

        req.on('data', (chunk) => {
            body = chunk.toString()
        })

        req.on('end', async () => {

            const {id} = URL.parse(url, true).query
            const usuario = JSON.parse(body)

            try {
                const result = await editarUsuario(usuario, id)
                res.statusCode = 200
                res.end(JSON.stringify(result))
            } catch (e) {
                res.statusCode = 500
                res.end('ERROR! en la edición de registros... ' + e)
            }
        })
    }

    // elimina un registro
    if (url.startsWith('/usuario?id') && req.method == 'DELETE') {

        try {

            let { id } = URL.parse(url, true).query

            await eliminarUsuario(id)

            res.end('Usuario eliminado')

        } catch (e) {
            
            res.statusCode = 500
            res.end('ERROR! al eliminar el registro... ' + e)

        }

    }

    // registro de transferencia
    if (url == '/transferencia' && req.method == 'POST') {
        let body = ''

        req.on('data', (chunk) => {
            body += chunk.toString()
        })

        req.on('end', async () => {

            try {

                const transf = JSON.parse(body)
                const result = await registrarTransferencia(transf)
                res.statusCode = 201
                res.end(JSON.stringify(result))
                
            } catch (e) {

                res.statusCode = 500
                res.end('ERROR! en el registro de transferencia... ' + e)

            }
        })
    }

    // muestra el historial de transferenicas
    if (url == '/transferencias' && req.method == 'GET') {

        try {

            const transf = await getTransferencias()
            res.end(JSON.stringify(transf))

        } catch (e) {
            
            res.statusCode = 500
            res.end('ERROR! al traer el historial... ' + e)

        }

    }

}).listen(3000, console.log('OK'))