const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: '1234',
    database: 'bancosolar',
    port: 5432
})

const guardarUsuario = async (usuario) => {
    
    const values = Object.values(usuario)

    const consulta = {
        text: 'INSERT INTO usuarios(nombre, balance) VALUES ($1, $2)',
        values
    }

    const result = await pool.query(consulta)
    return result

}

const getUsuarios = async () => {

    const result = await pool.query('SELECT * FROM usuarios')
    return result.rows

}

const editarUsuario = async (usuario, id) => {

    const values = Object.values(usuario)

    const consulta = {
        text: `UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = ${id} RETURNING *`,
        values
    }

    const result = await pool.query(consulta)
    return result

}

const eliminarUsuario = async (id) => {

    const result = await pool.query(`DELETE FROM usuarios WHERE id = ${id}`)
    return result.rows

}

const registrarTransferencia = async (transf) => {
    
    const values = Object.values(transf)

    const id1 = await pool.query(`select id from usuarios where nombre = '${values[0]}'` )
    const id2 = await pool.query(`select id from usuarios where nombre = '${values[1]}'` )
    const fecha = await pool.query("select to_char(now(), 'DD/MM/YYYY HH:MI')")

    const obj1 = Object.values(id1.rows[0])
    const obj2 = Object.values(id2.rows[0])
    const obj3 = Object.values(fecha.rows[0])

    const registrarTransf = {
        text: 'INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, $4)',
        values: [obj1[0], obj2[0], Number(values[2]), obj3[0]]
    }

    const editarEmisor = {
        text: `UPDATE usuarios SET balance = balance - $2 WHERE nombre = $1`,
        values: [values[0], Number(values[2])]
    }

    const editarReceptor = {
        text: `UPDATE usuarios SET balance = balance + $2 WHERE nombre = $1`,
        values: [values[1], Number(values[2])]
    }
    
    try {

        await pool.query('BEGIN')
        await pool.query(registrarTransf)
        await pool.query(editarEmisor)
        await pool.query(editarReceptor)
        await pool.query('COMMIT')

        return true
        
    } catch (e) {
        await pool.query('ROLLBACK')
        throw e
    }

}

const getTransferencias = async () => {

    const consulta1 = {
        text: 'select tr.fecha, u.nombre as emisor from usuarios u join transferencias tr on u.id = tr.emisor',
        rowMode: 'array'
    }

    const consulta2 = {
        text: 'select u.nombre, tr.monto as receptor from usuarios u join transferencias tr on u.id = tr.receptor',
        rowMode: 'array'
    }

    const result1 = await pool.query(consulta1)
    const result2 = await pool.query(consulta2)

    let res = []

    for (let i = 0; i < result1.rows.length; i++) {

        const filas = result1.rows[i].concat(result2.rows[i])

        res.push(filas)
        
    }

    return res

}

module.exports = { guardarUsuario, getUsuarios, editarUsuario, eliminarUsuario, registrarTransferencia, getTransferencias }