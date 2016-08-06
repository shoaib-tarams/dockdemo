/*
 *  Copyright 2016 AppDynamics, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not
 *  use this file except in compliance with the License.
 *
 *  A copy of the License is located at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

package com.appdynamics.sample.resource;

import com.google.inject.persist.Transactional;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.logging.Logger;

import static javax.ws.rs.core.MediaType.*;

/**
 * Created by mark.prichard on 6/21/16.
 */
public abstract class ResourceCollection<T> {
    private final Class<T> type;

    @Inject
    protected EntityManager manager;

    @Inject
    private Logger log;

    public ResourceCollection(Class<T> type) {
        this.type = type;
    }

    @GET
    @Produces(APPLICATION_JSON)
    @Path("{id}")
    public T get(@PathParam("id") int id) {
        return manager.find(type,id);
    }


    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(@PathParam("id") int id) {
        log.info("Deleted product: " + id);
        manager.remove(get(id));
        return Response.ok().build();
    }

    @GET
    @Produces(APPLICATION_JSON)
    public List<T> list() {
        return manager.createQuery(
                String.format("SELECT u FROM %s u", type.getName()), type)
                .getResultList();
    }
}
