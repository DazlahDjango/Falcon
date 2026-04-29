from uuid import UUID
from typing import Optional
from .org_chart_generator import OrgChartGeneratorService

class VisioExporterService:
    @staticmethod
    def generate_visio_xml(tenant_id: UUID, root_department_id: Optional[UUID] = None) -> str:
        org_chart = OrgChartGeneratorService().generate_json_org_chart(tenant_id, root_department_id)
        xml_parts = []
        xml_parts.append('<?xml version="1.0" encoding="UTF-8"?>')
        xml_parts.append('<VisioDocument xmlns="http://schemas.microsoft.com/visio/2003/core">')
        xml_parts.append('  <Pages>')
        xml_parts.append('    <Page ID="1" Name="Organization Chart">')
        xml_parts.append('      <Shapes>')
        shapes = []
        connectors = []
        def process_node(node: dict, parent_id: str = None, x: float = 0, y: float = 0, level: int = 0) -> str:
            node_id = f"Shape_{len(shapes) + 1}"
            shape_xml = f'''
        <Shape ID="{node_id}" Type="Shape">
          <Name>{VisioExporterService._escape_xml(node.get('name', ''))}</Name>
          <Text>
            <cp IX="0" />
            <tp>{VisioExporterService._escape_xml(node.get('name', ''))}</tp>
          </Text>
          <XForm>
            <PinX>{x}</PinX>
            <PinY>{y}</PinY>
            <Width>120</Width>
            <Height>60</Height>
          </XForm>
        </Shape>'''
            shapes.append(shape_xml)
            if parent_id:
                connector_id = f"Connector_{len(connectors) + 1}"
                connector_xml = f'''
        <Shape ID="{connector_id}" Type="Shape">
          <Master>Dynamic connector</Master>
          <Connect From="{parent_id}" To="{node_id}" />
        </Shape>'''
                connectors.append(connector_xml)
            child_x = x - 80 if level % 2 == 0 else x + 80
            child_y = y - 80
            children = node.get('children', [])
            for i, child in enumerate(children):
                process_node(child, node_id, child_x + (i * 160), child_y, level + 1)
            return node_id
        root_name = org_chart.get('name', 'Organization')
        root_children = org_chart.get('children', [])
        for i, child in enumerate(root_children):
            process_node(child, None, 0, 400 - (i * 100), 0)
        xml_parts.extend(shapes)
        xml_parts.extend(connectors)
        xml_parts.append('      </Shapes>')
        xml_parts.append('    </Page>')
        xml_parts.append('  </Pages>')
        xml_parts.append('</VisioDocument>')
        return ''.join(xml_parts)
    
    @staticmethod
    def _escape_xml(text: str) -> str:
        if not text:
            return ''
        replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;'
        }
        for char, escape in replacements.items():
            text = text.replace(char, escape)
        return text