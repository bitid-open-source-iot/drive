const Q = require('q')
const fs = require('fs')
const path = require('path')
const { exit } = require('process')

const readdir = async (dirpath) => {
    const deferred = Q.defer()
    fs.readdir(dirpath, (err, files) => {
        if (err) {
            deferred.reject(err)
        } else {
            deferred.resolve(files)
        }
    })
    return deferred.promise
}

const readfile = async (filepath) => {
    const deferred = Q.defer()
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            deferred.reject(err)
        } else {
            data = data.split('\n').filter(value => value.includes('router.get(') || value.includes('router.put(') || value.includes('router.post(')).map(value => {
                value = value.replace("router.get('", '')
                value = value.replace("router.put('", '')
                value = value.replace("router.post('", '')
                value = value.replace("', (req, res) => {", '')
                return value
            })
            deferred.resolve(data)
        }
    })
    return deferred.promise
}

const writefile = async (filepath, data) => {
    const deferred = Q.defer()
    fs.writeFile(filepath, data, (err, result) => {
        if (err) {
            deferred.reject(err)
        } else {
            deferred.resolve(result)
        }
    })
    return deferred.promise
}

const run = async () => {
    const files = await readdir(path.join(__dirname, '../../api'))
    const joins = await Q.all(files.map(async (file) => {
        const deferred = Q.defer()
        try {
            let data = await readfile(path.join(__dirname, '../../api', file))
            data = data.map(item => path.join('/', file.replace('.js', ''), item))
            deferred.resolve(data)
        } catch (error) {
            deferred.reject(error)
        }

        return deferred.promise
    }))
    const flatar = [].concat.apply([], joins).map(item => path.join('/drive', item))
    const unique = flatar.filter((item, index) => flatar.indexOf(item) === index)
    const result = unique.map(o => {
        return {
            url: o,
            appId: '000000000000000000000000',
            serverDate: new Date(),
            description: o
        }
    })
    await writefile(path.join(__dirname, '/scopes.json'), JSON.stringify(result, null, 4))
    exit(1)
}

run()