import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';
import { Project } from '@/modules/merchant-admin/projects/domain/entities/project';
import { ProjectId } from '@/modules/merchant-admin/projects/domain/value-objects/project-id';
import { AppId } from '@/modules/merchant-admin/projects/domain/value-objects/app-id';
import { MerchantId } from '@/modules/merchant-admin/projects/domain/value-objects/merchant-id';
import { ProjectStatus } from '@/modules/merchant-admin/projects/domain/value-objects/project-status';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  appId: z.string().min(1, 'App ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.string().default('active'),
  merchantId: z.string().min(1, 'Merchant ID is required'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const appId = searchParams.get('appId');
    const merchantId = searchParams.get('merchantId');

    if (!merchantId && !id && !appId) {
      return NextResponse.json({ error: 'Either merchantId, id, or appId is required' }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    let query = databaseClient.from('projects');

    if (id) {
      // Find by ID
      const { data, error } = await query
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    if (appId) {
      // Find by app_id
      const { data, error } = await query
        .select('*')
        .eq('app_id', appId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    if (merchantId) {
      // Find by merchant_id
      const { data, error } = await query
        .select('*')
        .eq('merchant_id', merchantId)
        .order('updated_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validationResult = CreateProjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    const data = validationResult.data;
    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    // Check if app_id already exists
    const { data: existingProject, error: checkError } = await databaseClient
      .from('projects')
      .select('id')
      .eq('app_id', data.appId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingProject) {
      return NextResponse.json({ error: 'Project with this app_id already exists' }, { status: 409 });
    }

    // Create project
    const projectData = {
      id: data.id,
      app_id: data.appId,
      name: data.name,
      description: data.description || null,
      status: data.status,
      merchant_id: data.merchantId,
      created_at: data.createdAt,
      updated_at: data.updatedAt
    };

    const { data: createdProject, error } = await databaseClient
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Project with this ID or app_id already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(createdProject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validationResult = UpdateProjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    const data = validationResult.data;
    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    const { data: updatedProject, error } = await databaseClient
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    const { error } = await databaseClient
      .from('projects')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}