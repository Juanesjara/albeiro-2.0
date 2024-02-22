module.exports = (only) => {
    if (only === 'artist') {
        return 'Adivina el artista de la cancion y ganaras **3 puntos**.';
    }

    if (only === 'title') {
        return 'Adivina el titulo titulo de la cancion y ganaras **2 puntos**.';
    }

    return`
        Adivina la cancion y el artista para ganar los siguientes puntos:
        > Artista - **3 puntos**
        > Titulo - **2 puntos**
        > Artista + titulo - **5 puntos**
    `.replace(/  +/g, '')

}