import React from 'react'


function Prueba() {
  return (
  <div className="container">
      <header>
        <h1>ENDURANCE</h1>
        <nav>
          <select>
            <option value="">Admin</option>
            <option value="">STAFF</option>
            <option value="">USER</option>
            <option value="">PROYECTOS</option>
          </select>
        </nav>
      </header>
      <aside>
        <ul>
          <li>Mantenimiento Admin</li>
          <li>Mantenimiento STAFF</li>
          <li>Mantenimiento USER</li>
          <li>Mantenimientos PROYECTOS</li>
        </ul>
        <ul>
          <li>Perfil</li>
          <li>Configuraciones</li>
        </ul>
      </aside>
      <main>
        <section>
          <h2>Mantenimiento Admin</h2>
          <form>
            <label>
              Nombre Admin:
              <input type="text" name="adminName" />
            </label>
            <label>
              Correo:
              <input type="email" name="email" placeholder="@gmail.com" />
            </label>
            <label>
              Contraseña:
              <input type="password" name="password" />
            </label>
            <button type="submit">Guardar</button>
            <button type="button">Cancelar</button>
          </form>
        </section>
        <section>
          <h2>Lista de Admin</h2>
          <ul>
            <li>____________________</li>
            <li>____________________</li>
            <li>____________________</li>
            <li>____________________</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

  
export default Prueba