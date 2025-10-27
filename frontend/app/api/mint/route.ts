import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      authors,
      description,
      tags,
      doi,
      license,
      version,
      uri,
      hash,
      collection,
    } = body;

    if (!title || !authors || !uri || !hash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Path to backend scripts (parent directory)
    const scriptsPath = join(process.cwd(), '..', 'scripts', 'assets');
    const scriptFile = join(scriptsPath, 'mint-auto-upload.ts');

    // Build command
    let command = `npx tsx ${scriptFile} --title "${title}" --authors "${authors}" --hash "${hash}" --uri "${uri}"`;

    if (collection) {
      command += ` --collection ${collection}`;
    }

    if (description) {
      command += ` --description "${description}"`;
    }

    if (tags) {
      command += ` --tags "${tags}"`;
    }

    if (doi) {
      command += ` --doi "${doi}"`;
    }

    if (license) {
      command += ` --license "${license}"`;
    }

    if (version) {
      command += ` --version "${version}"`;
    }

    // Execute backend script
    const { stdout, stderr } = await execAsync(command, {
      cwd: join(process.cwd(), '..'),
      timeout: 120000, // 2 minutes timeout
    });

    // Parse output to extract NFT mint address
    const mintMatch = stdout.match(/Mint: ([A-Za-z0-9]+)/);
    const metadataMatch = stdout.match(/Metadata URI.*: (https:\/\/[^\s]+)/);

    if (!mintMatch) {
      throw new Error('Failed to extract mint address from output');
    }

    return NextResponse.json({
      mint: mintMatch[1],
      metadataUri: metadataMatch ? metadataMatch[1] : undefined,
      output: stdout,
    });
  } catch (error) {
    console.error('Mint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to mint NFT',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

